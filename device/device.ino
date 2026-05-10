#include <WiFi.h>
#include <WebServer.h>
#include <Preferences.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define RESET_BUTTON_PIN 0

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

unsigned long resetPressStart = 25;
bool resetHandled = false;

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

void handleResetButton() {
  int buttonState = digitalRead(RESET_BUTTON_PIN);

  if (buttonState == LOW) {
    if (resetPressStart == 0) {
      resetPressStart = millis();
    }

    if (!resetHandled && millis() - resetPressStart >= 3000) {
      resetHandled = true;
      Serial.println("Reset config button pressed");
      clearConfig();
    }
  } else {
    resetPressStart = 0;
    resetHandled = false;
  }
}

// ===================== SETUP =====================

void setup() {
  Serial.begin(115200);

  initOLED();

  pinMode(RESET_BUTTON_PIN, INPUT_PULLUP);

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

  Serial.println("Config loaded successfully");
  Serial.println("Ready to connect MQTT later");
}

// ===================== LOOP =====================

void loop() {
  handleResetButton();

  if (setupMode) {
    server.handleClient();
    return;
  }

  // Sau này thêm:
  // handleMQTT();
  // handleFingerprint();
}