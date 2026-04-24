import 'dart:convert';

import 'package:flutter/cupertino.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/core/error/app_exception.dart';
import 'package:hrms/core/service/address/Province.dart';


class AddressRepo {
  Future<List<Province>> getProvinces() async {
      try{
        final jsonString =
        await rootBundle.loadString('assets/data/danhmucxaphuong.json');

        final List<dynamic> data = jsonDecode(jsonString);

        return data.map((e) => Province.fromJson(e)).toList();
      }catch(e){
        debugPrint("AddressRepo getProvine error: " + e.toString());
        throw AppException("Failed to load address data");
      }

  }
}

final addressRepoProvider = Provider<AddressRepo>((ref) {
  return AddressRepo();
});