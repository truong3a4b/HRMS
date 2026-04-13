class CurrencyConvert {
  //Ham chuyen doi so tien sang dinh dang tien viet nam, voi dau phay ngan cach hang nghin va them don vi "VND" vao cuoi chuoi
  static String convertToCurrency(double? amount) {
    if(amount == null) {
      return '-';
    }
    final String amountStr = amount.toStringAsFixed(0);
    final StringBuffer result = StringBuffer();
    int count = 0;
    for (int i = amountStr.length - 1; i >= 0; i--) {
      result.write(amountStr[i]);
      count++;
      if (count == 3 && i != 0) {
        result.write(',');
        count = 0;
      }
    }
    return result.toString().split('').reversed.join() + ' VND';
  }
}