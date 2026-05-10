#include <WiFi.h>
#include <WebServer.h>
#include <Preferences.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <WiFiClientSecure.h>
#include <Adafruit_Fingerprint.h>
#include <string.h>

#define RESET_BUTTON_PIN 25

Preferences preferences;
WebServer server(80);

String wifiSsid;
String wifiPassword;
String mqttHost;
String mqttPort;
String deviceCode;
String mqttUsername;
String mqttPassword;

bool setupMode = false;

const char* AP_SSID = "HRMS_ATTENDANCE_SETUP";
const char* AP_PASSWORD = "12345678";

unsigned long resetPressStart = 0;
bool resetHandled = false;

//MQTT
WiFiClientSecure espClient;
PubSubClient mqttClient(espClient);

unsigned long lastHeartbeatAt = 0;
const unsigned long HEARTBEAT_INTERVAL = 30000; // 30 giây

String getBaseTopic() {
  return "hrms/attendance/devices/" + deviceCode;
}

String getHeartbeatTopic() {
  return getBaseTopic() + "/heartbeat";
}

String getCommandTopic() {
  return getBaseTopic() + "/commands";
}

//AS608
HardwareSerial fingerSerial(2);

Adafruit_Fingerprint finger = Adafruit_Fingerprint(&fingerSerial);

const int FINGERPRINT_MIN_ID = 1;
const int FINGERPRINT_MAX_ID = 127;
const int FINGERPRINT_SCAN_RETRIES = 3;
const int FP_COMMAND_REGISTER = 1;
const int FP_COMMAND_DELETE = 2;
const int COMMAND_ID_SIZE = 48;
const int EMPLOYEE_ID_SIZE = 48;
const int FINGER_NAME_SIZE = 24;

struct FingerprintJob {
  int command;
  int fingerId;
  char commandId[COMMAND_ID_SIZE];
  char employeeId[EMPLOYEE_ID_SIZE];
  char fingerName[FINGER_NAME_SIZE];
};

QueueHandle_t fingerprintQueue = NULL;
SemaphoreHandle_t mqttMutex = NULL;
bool fingerprintBusy = false;
char activeCommandId[COMMAND_ID_SIZE] = "";
char activeEmployeeId[EMPLOYEE_ID_SIZE] = "";
char activeFingerName[FINGER_NAME_SIZE] = "";
char activeEnrollErrorStep[24] = "";
int activeEnrollErrorCode = 0;


// CONFIG OLED
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

Adafruit_SSD1306 display(
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  &Wire,
  OLED_RESET
);

void showMessage(String line1, String line2 = "", String line3 = "", String line4 = "") {
  display.clearDisplay();

  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);

  display.setCursor(0, 0);
  display.println(line1);

  display.setCursor(0, 16);
  display.println(line2);

  display.setCursor(0, 32);
  display.println(line3);

  display.setCursor(0, 48);
  display.println(line4);

  display.display();
}

void initOLED() {
  Wire.begin(21, 22);

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("OLED init failed");
    return;
  }

  display.clearDisplay();
  display.display();

  showMessage("HRMS Attendance", "Starting...");
}



// ===================== LOAD CONFIG =====================

bool loadConfig() {
  preferences.begin("hrms-config", true);

  wifiSsid = preferences.getString("wifi_ssid", "");
  wifiPassword = preferences.getString("wifi_pass", "");
  mqttHost = preferences.getString("mqtt_host", "");
  mqttPort = preferences.getString("mqtt_port", "1883");
  deviceCode = preferences.getString("device_code", "");
  mqttUsername = preferences.getString("mqtt_user", "");
  mqttPassword = preferences.getString("mqtt_pass", "");

  preferences.end();

  return wifiSsid.length() > 0 &&
         mqttHost.length() > 0 &&
         deviceCode.length() > 0 &&
         mqttUsername.length() > 0 &&
         mqttPassword.length() > 0;
}

// ===================== SAVE CONFIG =====================

void saveConfig(
  String ssid,
  String pass,
  String host,
  String port,
  String code,
  String user,
  String mqttPass
) {
  preferences.begin("hrms-config", false);

  preferences.putString("wifi_ssid", ssid);
  preferences.putString("wifi_pass", pass);
  preferences.putString("mqtt_host", host);
  preferences.putString("mqtt_port", port);
  preferences.putString("device_code", code);
  preferences.putString("mqtt_user", user);
  preferences.putString("mqtt_pass", mqttPass);

  preferences.end();
}

// ===================== CLEAR CONFIG =====================

void clearConfig() {
  showMessage("Reset config", "Clearing...", "Restarting...");

  preferences.begin("hrms-config", false);
  preferences.clear();
  preferences.end();

  delay(1000);
  ESP.restart();
}

// ====================MQTT CONFIG =======================
int findAvailableFingerId();
bool enrollNextAvailableFingerprint();
bool enrollFingerprint(int fingerId);
bool deleteFingerprint(int fingerId);
void publishEnrollResult(bool success, int fingerId);
void publishDeleteResult(bool success, int fingerId);
bool queueFingerprintJob(int command, int fingerId = -1, const char* commandId = "", const char* employeeId = "", const char* fingerName = "");
void fingerprintTask(void *parameter);
bool publishMqttMessage(const String& topic, const String& payload);
void copyText(char* target, size_t targetSize, const char* source);
void clearActiveFingerprintJob();
void clearEnrollError();
void setEnrollError(const char* step, int code);
void waitUntilFingerRemoved(unsigned long timeoutMs);
//callback nhan lenh
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message = "";

  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.print("MQTT message received: ");
  Serial.println(topic);
  Serial.println(message);

  StaticJsonDocument<512> doc;

  DeserializationError err = deserializeJson(doc, message);

  if (err) {
    Serial.println("JSON parse failed");
    return;
  }

  String command = doc["command"];
  const char* commandId = doc["commandId"] | "";

  if (command == "register_fingerprint") {
    const char* employeeId = doc["payload"]["employeeId"] | "";
    const char* fingerName = doc["payload"]["fingerName"] | "";

    if (!queueFingerprintJob(FP_COMMAND_REGISTER, -1, commandId, employeeId, fingerName)) {
      Serial.println("Fingerprint queue full, register command ignored");
    }
  }

  if (command == "delete_fingerprint") {
    int fingerId = doc["payload"]["fingerId"];

    if (!queueFingerprintJob(FP_COMMAND_DELETE, fingerId, commandId)) {
      Serial.println("Fingerprint queue full, delete command ignored");
    }
  }
}

//mqtt connect
bool connectMQTT() {
  if (mqttClient.connected()) {
    return true;
  }

  showMessage("MQTT TLS", mqttHost, "Device:", deviceCode);
  Serial.println("Connecting MQTT TLS...");

  espClient.setInsecure(); // bỏ kiểm tra chứng chỉ, dễ test trước

  mqttClient.setServer(mqttHost.c_str(), mqttPort.toInt());
  mqttClient.setCallback(mqttCallback);
  mqttClient.setBufferSize(512);

  String clientId = "hrms_" + deviceCode;

  bool connected = mqttClient.connect(
    clientId.c_str(),
    mqttUsername.c_str(),
    mqttPassword.c_str()
  );

  if (connected) {
    Serial.println("MQTT TLS connected");

    String commandTopic = getCommandTopic();
    mqttClient.subscribe(commandTopic.c_str());

    Serial.print("Subscribed: ");
    Serial.println(commandTopic);

    showMessage("MQTT connected", "TLS OK", "Device:", deviceCode);

    publishHeartbeat();
    return true;
  }

  Serial.print("MQTT TLS failed, rc=");
  Serial.println(mqttClient.state());

  showMessage("MQTT TLS failed", "RC: " + String(mqttClient.state()));

  return false;
}

//ham gui heartbeat
void publishHeartbeat() {
  if (!mqttClient.connected()) {
    return;
  }

  StaticJsonDocument<256> doc;

  doc["deviceCode"] = deviceCode;
  doc["status"] = "ONLINE";
  doc["ipAddress"] = WiFi.localIP().toString();
  doc["wifiRssi"] = WiFi.RSSI();
  doc["freeHeap"] = ESP.getFreeHeap();
  doc["uptime"] = millis();

  String payload;
  serializeJson(doc, payload);

  String topic = getHeartbeatTopic();

  bool ok = publishMqttMessage(topic, payload);

  Serial.print("Heartbeat publish: ");
  Serial.println(ok ? "OK" : "FAILED");

  Serial.println(topic);
  Serial.println(payload);
}

bool publishMqttMessage(const String& topic, const String& payload) {
  if (!mqttClient.connected()) {
    return false;
  }

  bool ok = false;

  if (mqttMutex == NULL || xSemaphoreTake(mqttMutex, portMAX_DELAY) == pdTRUE) {
    ok = mqttClient.publish(topic.c_str(), payload.c_str());
    mqttClient.loop();

    if (mqttMutex != NULL) {
      xSemaphoreGive(mqttMutex);
    }
  }

  return ok;
}

//handle mqtt connect
void handleMQTT() {
  delay(1000);
  if (WiFi.status() != WL_CONNECTED) {
    return;
  }

  if (!mqttClient.connected()) {
    connectMQTT();
    return;
  }

  if (mqttMutex == NULL || xSemaphoreTake(mqttMutex, portMAX_DELAY) == pdTRUE) {
    mqttClient.loop();

    if (mqttMutex != NULL) {
      xSemaphoreGive(mqttMutex);
    }
  }

  if (millis() - lastHeartbeatAt >= HEARTBEAT_INTERVAL) {
    lastHeartbeatAt = millis();
    publishHeartbeat();
  }
}

//==================== AS608 CONFIG =================
bool initFingerprintSensor() {
  fingerSerial.begin(57600, SERIAL_8N1, 18, 19);

  finger.begin(57600);

  if (finger.verifyPassword()) {
    Serial.println("AS608 found");

    showMessage(
      "Fingerprint OK",
      "Templates: " + String(finger.templateCount)
    );

    return true;
  }

  Serial.println("AS608 not found");

  showMessage("AS608 ERROR");

  return false;
}

//scan finger
int scanFingerprint() {
  uint8_t p = FINGERPRINT_NOFINGER;

  for (int attempt = 1; attempt <= FINGERPRINT_SCAN_RETRIES; attempt++) {
    p = finger.getImage();

    if (p == FINGERPRINT_NOFINGER) {
      return -1;
    }

    if (p != FINGERPRINT_OK) {
      Serial.print("getImage error: ");
      Serial.println(p);

      showMessage(
        "Fingerprint error",
        "getImage: " + String(p)
      );

      delay(1000);

      return -1;
    }

    Serial.println("Finger detected");

    showMessage(
      "Fingerprint detected",
      "Processing...",
      "Attempt " + String(attempt)
    );

    p = finger.image2Tz();

    if (p != FINGERPRINT_OK) {
      Serial.print("image2Tz error: ");
      Serial.println(p);

      showMessage(
        "Fingerprint processing error"
      );

      delay(1000);

      return -1;
    }

    p = finger.fingerFastSearch();

    Serial.print("fingerFastSearch code: ");
    Serial.println(p);

    if (p == FINGERPRINT_OK) {
      Serial.print("Found ID: ");
      Serial.println(finger.fingerID);
      Serial.print("Confidence: ");
      Serial.println(finger.confidence);

      return finger.fingerID;
    }

    if (p != FINGERPRINT_NOTFOUND) {
      Serial.print("fingerFastSearch error: ");
      Serial.println(p);

      showMessage(
        "Fingerprint error"
      );

      delay(1000);

      return -1;
    }

    Serial.println("Fingerprint not matched, retrying");
    vTaskDelay(400 / portTICK_PERIOD_MS);
  }

  Serial.println("Fingerprint not registered");

  showMessage(
    "Not registered",
    "Please enroll"
  );

  delay(1500);

  return -1;
}

//publish punch
void publishPunch(int fingerId) {
  if (!mqttClient.connected()) {
    return;
  }

  StaticJsonDocument<256> doc;

  doc["fingerId"] = fingerId;
  doc["recordedAt"] = millis();

  String payload;
  serializeJson(doc, payload);

  String topic = getBaseTopic() + "/punch";

  publishMqttMessage(topic, payload);

  Serial.println("Punch published");

  //cham cong thanh cong, hien thong bao va gui len server
  showMessage(
    "Punch success"
  );
}

void handleFingerprintAttendance() {
  int fingerId = scanFingerprint();

  if (fingerId <= 0) {
    return;
  }

  Serial.print("Finger detected: ");
  Serial.println(fingerId);

  publishPunch(fingerId);

  delay(2000);
}

void copyText(char* target, size_t targetSize, const char* source) {
  if (targetSize == 0) {
    return;
  }

  if (source == NULL) {
    source = "";
  }

  strncpy(target, source, targetSize - 1);
  target[targetSize - 1] = '\0';
}

void clearActiveFingerprintJob() {
  activeCommandId[0] = '\0';
  activeEmployeeId[0] = '\0';
  activeFingerName[0] = '\0';
  clearEnrollError();
}

void clearEnrollError() {
  activeEnrollErrorStep[0] = '\0';
  activeEnrollErrorCode = 0;
}

void setEnrollError(const char* step, int code) {
  copyText(activeEnrollErrorStep, sizeof(activeEnrollErrorStep), step);
  activeEnrollErrorCode = code;

  Serial.print("Enroll failed at ");
  Serial.print(activeEnrollErrorStep);
  Serial.print(", code=");
  Serial.println(activeEnrollErrorCode);
}

void waitUntilFingerRemoved(unsigned long timeoutMs) {
  unsigned long startedAt = millis();

  while (millis() - startedAt < timeoutMs) {
    if (finger.getImage() == FINGERPRINT_NOFINGER) {
      return;
    }

    vTaskDelay(100 / portTICK_PERIOD_MS);
  }
}

bool queueFingerprintJob(int command, int fingerId, const char* commandId, const char* employeeId, const char* fingerName) {
  if (fingerprintQueue == NULL) {
    return false;
  }

  FingerprintJob job;
  job.command = command;
  job.fingerId = fingerId;
  copyText(job.commandId, COMMAND_ID_SIZE, commandId);
  copyText(job.employeeId, EMPLOYEE_ID_SIZE, employeeId);
  copyText(job.fingerName, FINGER_NAME_SIZE, fingerName);

  return xQueueSend(fingerprintQueue, &job, 0) == pdTRUE;
}

int findAvailableFingerId() {
  for (int id = FINGERPRINT_MIN_ID; id <= FINGERPRINT_MAX_ID; id++) {
    uint8_t p = finger.loadModel(id);

    if (p != FINGERPRINT_OK) {
      Serial.print("Available finger ID: ");
      Serial.println(id);
      return id;
    }
  }

  Serial.println("No available finger ID");
  return -1;
}

bool enrollNextAvailableFingerprint() {
  int fingerId = findAvailableFingerId();

  if (fingerId < FINGERPRINT_MIN_ID) {
    setEnrollError("findEmptyId", -1);
    showMessage("Enroll failed", "No empty ID");
    publishEnrollResult(false, -1);
    vTaskDelay(3000 / portTICK_PERIOD_MS);
    return false;
  }

  return enrollFingerprint(fingerId);
}

void fingerprintTask(void *parameter) {
  FingerprintJob job;

  while (true) {
    if (xQueueReceive(fingerprintQueue, &job, 0) == pdTRUE) {
      fingerprintBusy = true;
      copyText(activeCommandId, COMMAND_ID_SIZE, job.commandId);
      copyText(activeEmployeeId, EMPLOYEE_ID_SIZE, job.employeeId);
      copyText(activeFingerName, FINGER_NAME_SIZE, job.fingerName);

      if (job.command == FP_COMMAND_REGISTER) {
        enrollNextAvailableFingerprint();
      } else if (job.command == FP_COMMAND_DELETE) {
        deleteFingerprint(job.fingerId);
      }

      clearActiveFingerprintJob();
      fingerprintBusy = false;
    } else {
      handleFingerprintAttendance();
    }

    vTaskDelay(50 / portTICK_PERIOD_MS);
  }
}

bool enrollFingerprint(int fingerId) {
  clearEnrollError();

  showMessage(
    "Enroll fingerprint",
    "Finger ID: " + String(fingerId),
    "Place finger"
  );
  
  int p = -1;

  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
  }

  p = finger.image2Tz(1);

  if (p != FINGERPRINT_OK) {
    setEnrollError("image2Tz1", p);
    showMessage("Enroll failed", "image2Tz 1: " + String(p));
    publishEnrollResult(false, fingerId);
    vTaskDelay(3000 / portTICK_PERIOD_MS);
    return false;
  }

  p = finger.fingerSearch();

  if (p == FINGERPRINT_OK) {
    int existingFingerId = finger.fingerID;

    showMessage(
      "Already enrolled",
      "Finger ID: " + String(existingFingerId),
      "Sent to server"
    );

    publishEnrollResult(true, existingFingerId);
    waitUntilFingerRemoved(10000);
    vTaskDelay(3000 / portTICK_PERIOD_MS);

    return true;
  }

  showMessage("Remove finger");

  delay(2000);

  p = 0;

  while (p != FINGERPRINT_NOFINGER) {
    p = finger.getImage();
  }

  showMessage("Place again");

  p = -1;

  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
  }

  p = finger.image2Tz(2);

  if (p != FINGERPRINT_OK) {
    setEnrollError("image2Tz2", p);
    showMessage("Enroll failed", "image2Tz 2: " + String(p));
    publishEnrollResult(false, fingerId);
    vTaskDelay(3000 / portTICK_PERIOD_MS);
    return false;
  }

  p = finger.createModel();

  if (p != FINGERPRINT_OK) {
    setEnrollError("createModel", p);
    showMessage("Enroll failed", "createModel: " + String(p));
    publishEnrollResult(false, fingerId);
    vTaskDelay(3000 / portTICK_PERIOD_MS);
    return false;
  }

  p = finger.storeModel(fingerId);

  if (p != FINGERPRINT_OK) {
    setEnrollError("storeModel", p);
    showMessage("Enroll failed", "storeModel: " + String(p));
    publishEnrollResult(false, fingerId);
    vTaskDelay(3000 / portTICK_PERIOD_MS);
    return false;
  }

  p = finger.loadModel(fingerId);

  if (p != FINGERPRINT_OK) {
    setEnrollError("verifyStore", p);
    showMessage("Enroll failed", "verifyStore: " + String(p));
    publishEnrollResult(false, fingerId);
    vTaskDelay(3000 / portTICK_PERIOD_MS);
    return false;
  }

  finger.getTemplateCount();
  Serial.print("Stored finger ID verified: ");
  Serial.println(fingerId);
  Serial.print("Template count: ");
  Serial.println(finger.templateCount);

  showMessage(
    "Enroll success",
    "Finger ID: " + String(fingerId),
    "Sent to server"
  );

  publishEnrollResult(true, fingerId);
  waitUntilFingerRemoved(10000);
  vTaskDelay(3000 / portTICK_PERIOD_MS);

  return true;
}

bool deleteFingerprint(int fingerId) {
  uint8_t p = finger.deleteModel(fingerId);

  if (p == FINGERPRINT_OK) {
    showMessage(
      "Delete success",
      "Finger ID: " + String(fingerId)
    );

    publishDeleteResult(true, fingerId);

    return true;
  }

  showMessage("Delete failed");

  publishDeleteResult(false, fingerId);

  return false;
}
void publishEnrollResult(bool success, int fingerId) {
  StaticJsonDocument<384> doc;

  if (strlen(activeCommandId) > 0) {
    doc["commandId"] = activeCommandId;
  }

  doc["command"] = "register_fingerprint";
  doc["status"] =
    success ? "success" : "failed";

  doc["fingerId"] = fingerId;

  if (strlen(activeEmployeeId) > 0) {
    doc["employeeId"] = activeEmployeeId;
  }

  if (strlen(activeFingerName) > 0) {
    doc["fingerName"] = activeFingerName;
  }

  if (!success && strlen(activeEnrollErrorStep) > 0) {
    doc["errorStep"] = activeEnrollErrorStep;
    doc["errorCode"] = activeEnrollErrorCode;
  }

  String payload;
  serializeJson(doc, payload);

  String topic =
    getBaseTopic() + "/commands/result";

  bool ok = publishMqttMessage(topic, payload);

  Serial.println("Enroll result published:");
  Serial.println(ok ? "OK" : "FAILED");
  Serial.println(topic);
  Serial.println(payload);
}

void publishDeleteResult(bool success, int fingerId) {
  if (!mqttClient.connected()) {
    return;
  }

  StaticJsonDocument<384> doc;

  if (strlen(activeCommandId) > 0) {
    doc["commandId"] = activeCommandId;
  }

  doc["command"] = "delete_fingerprint";
  doc["status"] = success ? "success" : "failed";
  doc["fingerId"] = fingerId;

  String payload;
  serializeJson(doc, payload);

  String topic = getBaseTopic() + "/commands/result";

  bool ok = publishMqttMessage(topic, payload);

  Serial.println("Delete result published:");
  Serial.println(ok ? "OK" : "FAILED");
  Serial.println(topic);
  Serial.println(payload);
}
// ===================== CONNECT WIFI =====================

bool connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(wifiSsid.c_str(), wifiPassword.c_str());

  Serial.println("Connecting WiFi...");
  showMessage("Connecting WiFi", wifiSsid);

  unsigned long startAttempt = millis();

  while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < 15000) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("WiFi connected");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());

    showMessage("WiFi connected", WiFi.localIP().toString());

    return true;
  }

  Serial.println("WiFi connect failed");
  showMessage("WiFi failed", "Starting setup...");

  return false;
}

// ===================== WEB PAGE =====================

String setupPage() {
  String html = "";

  html += "<!DOCTYPE html><html><head>";
  html += "<meta name='viewport' content='width=device-width, initial-scale=1'>";
  html += "<title>HRMS Attendance Setup</title>";
  html += "<style>";
  html += "body{font-family:Arial;padding:20px;background:#f5f5f5;}";
  html += ".card{background:#fff;padding:20px;border-radius:12px;max-width:420px;margin:auto;}";
  html += "input{width:100%;padding:10px;margin:8px 0;box-sizing:border-box;}";
  html += "button{width:100%;padding:12px;background:#0069B4;color:white;border:none;border-radius:8px;font-size:16px;}";
  html += "</style>";
  html += "</head><body>";
  html += "<div class='card'>";
  html += "<h2>HRMS Attendance Setup</h2>";
  html += "<form method='POST' action='/save'>";

  html += "<label>WiFi SSID</label>";
  html += "<input name='wifi_ssid' required>";

  html += "<label>WiFi Password</label>";
  html += "<input name='wifi_pass' type='password'>";

  html += "<label>MQTT Host</label>";
  html += "<input name='mqtt_host' value='broker.hivemq.com' required>";

  html += "<label>MQTT Port</label>";
  html += "<input name='mqtt_port' value='1883' required>";

  html += "<label>Device Code</label>";
  html += "<input name='device_code' placeholder='DEVICE_001' required>";

  html += "<label>MQTT Username</label>";
  html += "<input name='mqtt_user' placeholder='DEVICE_001' required>";

  html += "<label>MQTT Password</label>";
  html += "<input name='mqtt_pass' type='password' required>";

  html += "<button type='submit'>Save & Restart</button>";
  html += "</form>";
  html += "</div></body></html>";

  return html;
}

// ===================== START SETUP MODE =====================

void startSetupMode() {
  setupMode = true;

  WiFi.mode(WIFI_AP);
  WiFi.softAP(AP_SSID, AP_PASSWORD);

  IPAddress ip = WiFi.softAPIP();

  showMessage(
    "SETUP MODE",
    String("WiFi: ") + AP_SSID,
    String("Pass: ") + AP_PASSWORD,
    String("IP: ") + ip.toString()
  );

  Serial.println("Setup mode started");

  server.on("/", HTTP_GET, []() {
    server.send(200, "text/html", setupPage());
  });

  server.on("/save", HTTP_POST, []() {
    String ssid = server.arg("wifi_ssid");
    String pass = server.arg("wifi_pass");
    String host = server.arg("mqtt_host");
    String port = server.arg("mqtt_port");
    String code = server.arg("device_code");
    String user = server.arg("mqtt_user");
    String mqttPass = server.arg("mqtt_pass");

    saveConfig(ssid, pass, host, port, code, user, mqttPass);

    showMessage("Config saved", "Restarting...");

    server.send(
      200,
      "text/html",
      "<h2>Saved successfully</h2><p>Device will restart...</p>"
    );

    delay(1000);
    ESP.restart();
  });

  server.begin();
}

// ===================== RESET BUTTON =====================

void resetButtonTask(void *parameter) {
  bool isPressing = false;
  unsigned long pressedAt = 0;
  bool triggered = false;

  while (true) {
    int buttonState = digitalRead(RESET_BUTTON_PIN);

    if (buttonState == LOW) {
      if (!isPressing) {
        isPressing = true;
        pressedAt = millis();
        triggered = false;

        Serial.println("Reset button pressed");
      }

      if (!triggered && millis() - pressedAt >= 3000) {
        triggered = true;

        Serial.println("Reset config triggered");

        preferences.begin("hrms-config", false);
        preferences.clear();
        preferences.end();

        delay(300);
        ESP.restart();
      }
    } else {
      isPressing = false;
      pressedAt = 0;
      triggered = false;
    }

    vTaskDelay(50 / portTICK_PERIOD_MS);
  }
}

// ===================== SETUP =====================

void setup() {
  Serial.begin(115200);
  delay(1000);
  initOLED();
  bool fingerprintReady = initFingerprintSensor();

  pinMode(RESET_BUTTON_PIN, INPUT_PULLUP);
  xTaskCreatePinnedToCore(
    resetButtonTask,
    "ResetButtonTask",
    4096,
    NULL,
    1,
    NULL,
    1
  );

  bool hasConfig = loadConfig();

  if (!hasConfig) {
    Serial.println("No config found");
    showMessage("Setup required", "WiFi:", AP_SSID, "IP: 192.168.4.1");
    startSetupMode();
    return;
  }

  showMessage("Connecting WiFi", wifiSsid);

  bool wifiConnected = connectWiFi();

  if (!wifiConnected) {
    Serial.println("WiFi failed, start setup mode");
    showMessage("WiFi failed", "Setup mode", AP_SSID, "IP: 192.168.4.1");
    startSetupMode();
    return;
  }

  showMessage("WiFi connected", WiFi.localIP().toString(), "Device:", deviceCode);
  mqttMutex = xSemaphoreCreateMutex();
  fingerprintQueue = xQueueCreate(5, sizeof(FingerprintJob));
  connectMQTT();

  if (fingerprintReady && fingerprintQueue != NULL) {
    xTaskCreatePinnedToCore(
      fingerprintTask,
      "FingerprintTask",
      8192,
      NULL,
      1,
      NULL,
      0
    );
  } else {
    Serial.println("Fingerprint task not started");
  }

  Serial.println("Config loaded successfully");
  Serial.println("Ready to connect MQTT later");
}

// ===================== LOOP =====================

void loop() {
  if (setupMode) {
    server.handleClient();
    return;
  }
  handleMQTT();
}
