import 'package:hrms/feature/employee/data/models/employee_dto.dart';
import 'package:hrms/feature/employee/domain/entities/employee.dart';

import '../../../../core/service/address/Ward.dart';
import '../../../../core/service/address/provine_summary.dart';
import '../../../../core/service/bank/bank.dart';
import '../../../department/data/mapper/department_mapper.dart';
import '../../../position/data/mapper/posittion_mapper.dart';

extension EmployeeMapper on EmployeeDto {
  Employee toEntity() {
    return Employee(
      id: id,
      employeeId: employeeId,
      name: name,
      email: email,
      phone: phone,
      avatar: avatar,
      status: status.toEmployeeStatus(),
      dateOfBirth: dateOfBirth,
      gender: gender?.toGender(),
      address: address,
      hireDate: hireDate,
      salary: salary?.toDoubleValue(),
      bankAccount: bankAccount,
      maritalStatus: maritalStatus,
      nationality: nationality,
      religion: religion,
      identityCardNumber: identityCardNumber,
      identityCardIssueDate: identityCardIssueDate,
      frontIdentityCardImage: frontIdentityCardImage,
      backIdentityCardImage: backIdentityCardImage,
      department: department?.toEntity(),
      position: position?.toEntity(),

      // Nếu provinceCode, wardCode, bankCode chỉ là String code
      // thì chưa map được sang object đầy đủ nếu chưa có danh sách Province/Ward/Bank.
      province: province != null
          ? ProvinceSummary(maTinhBNV: province!.id, name: province!.name)
          : null,
      ward: ward != null ? Ward(code: ward!.id, name: ward!.name) : null,
      bank: bank != null ? Bank(id: bank!.id, name: bank!.name) : null,
    );
  }
}

extension EmployeeDtoListMapper on List<EmployeeDto> {
  List<Employee> toEntityList() {
    return map((e) => e.toEntity()).toList();
  }
}

extension GenderMapper on String {
  Gender toGender() {
    switch (this) {
      case 'MALE':
        return Gender.MALE;
      case 'FEMALE':
        return Gender.FEMALE;
      case 'OTHER':
        return Gender.OTHER;
      default:
        throw Exception('Giới tính không hợp lệ: $this');
    }
  }
}

extension EmployeeStatusMapper on String {
  EmployeeStatus toEmployeeStatus() {
    switch (this) {
      case 'WORKING':
        return EmployeeStatus.WORKING;
      case 'ON_LEAVE':
        return EmployeeStatus.ON_LEAVE;
      case 'RESIGNED':
        return EmployeeStatus.RESIGNED;
      default:
        throw Exception('Trạng thái nhân viên không hợp lệ: $this');
    }
  }
}

extension SalaryMapper on String {
  double? toDoubleValue() {
    return double.tryParse(this);
  }
}
