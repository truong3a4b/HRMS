// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'employee_dto.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$EmployeeDto {

 String get id; String get employeeId; String get name; String get email; String? get phone; String? get avatar; String get status; DateTime? get dateOfBirth; String? get gender; String? get address; DateTime? get hireDate; String? get salary; String? get bankAccount; BaseOptionDto? get bank; String? get maritalStatus; String? get nationality; String? get religion; String? get identityCardNumber; DateTime? get identityCardIssueDate; String? get frontIdentityCardImage; String? get backIdentityCardImage; BaseOptionDto? get province; BaseOptionDto? get ward; String? get userId; String? get departmentId; String? get positionId; DateTime? get createdAt; DateTime? get updatedAt; UserDto? get user; DepartmentDto? get department; PositionDto? get position;
/// Create a copy of EmployeeDto
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$EmployeeDtoCopyWith<EmployeeDto> get copyWith => _$EmployeeDtoCopyWithImpl<EmployeeDto>(this as EmployeeDto, _$identity);

  /// Serializes this EmployeeDto to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is EmployeeDto&&(identical(other.id, id) || other.id == id)&&(identical(other.employeeId, employeeId) || other.employeeId == employeeId)&&(identical(other.name, name) || other.name == name)&&(identical(other.email, email) || other.email == email)&&(identical(other.phone, phone) || other.phone == phone)&&(identical(other.avatar, avatar) || other.avatar == avatar)&&(identical(other.status, status) || other.status == status)&&(identical(other.dateOfBirth, dateOfBirth) || other.dateOfBirth == dateOfBirth)&&(identical(other.gender, gender) || other.gender == gender)&&(identical(other.address, address) || other.address == address)&&(identical(other.hireDate, hireDate) || other.hireDate == hireDate)&&(identical(other.salary, salary) || other.salary == salary)&&(identical(other.bankAccount, bankAccount) || other.bankAccount == bankAccount)&&(identical(other.bank, bank) || other.bank == bank)&&(identical(other.maritalStatus, maritalStatus) || other.maritalStatus == maritalStatus)&&(identical(other.nationality, nationality) || other.nationality == nationality)&&(identical(other.religion, religion) || other.religion == religion)&&(identical(other.identityCardNumber, identityCardNumber) || other.identityCardNumber == identityCardNumber)&&(identical(other.identityCardIssueDate, identityCardIssueDate) || other.identityCardIssueDate == identityCardIssueDate)&&(identical(other.frontIdentityCardImage, frontIdentityCardImage) || other.frontIdentityCardImage == frontIdentityCardImage)&&(identical(other.backIdentityCardImage, backIdentityCardImage) || other.backIdentityCardImage == backIdentityCardImage)&&(identical(other.province, province) || other.province == province)&&(identical(other.ward, ward) || other.ward == ward)&&(identical(other.userId, userId) || other.userId == userId)&&(identical(other.departmentId, departmentId) || other.departmentId == departmentId)&&(identical(other.positionId, positionId) || other.positionId == positionId)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt)&&(identical(other.user, user) || other.user == user)&&(identical(other.department, department) || other.department == department)&&(identical(other.position, position) || other.position == position));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hashAll([runtimeType,id,employeeId,name,email,phone,avatar,status,dateOfBirth,gender,address,hireDate,salary,bankAccount,bank,maritalStatus,nationality,religion,identityCardNumber,identityCardIssueDate,frontIdentityCardImage,backIdentityCardImage,province,ward,userId,departmentId,positionId,createdAt,updatedAt,user,department,position]);

@override
String toString() {
  return 'EmployeeDto(id: $id, employeeId: $employeeId, name: $name, email: $email, phone: $phone, avatar: $avatar, status: $status, dateOfBirth: $dateOfBirth, gender: $gender, address: $address, hireDate: $hireDate, salary: $salary, bankAccount: $bankAccount, bank: $bank, maritalStatus: $maritalStatus, nationality: $nationality, religion: $religion, identityCardNumber: $identityCardNumber, identityCardIssueDate: $identityCardIssueDate, frontIdentityCardImage: $frontIdentityCardImage, backIdentityCardImage: $backIdentityCardImage, province: $province, ward: $ward, userId: $userId, departmentId: $departmentId, positionId: $positionId, createdAt: $createdAt, updatedAt: $updatedAt, user: $user, department: $department, position: $position)';
}


}

/// @nodoc
abstract mixin class $EmployeeDtoCopyWith<$Res>  {
  factory $EmployeeDtoCopyWith(EmployeeDto value, $Res Function(EmployeeDto) _then) = _$EmployeeDtoCopyWithImpl;
@useResult
$Res call({
 String id, String employeeId, String name, String email, String? phone, String? avatar, String status, DateTime? dateOfBirth, String? gender, String? address, DateTime? hireDate, String? salary, String? bankAccount, BaseOptionDto? bank, String? maritalStatus, String? nationality, String? religion, String? identityCardNumber, DateTime? identityCardIssueDate, String? frontIdentityCardImage, String? backIdentityCardImage, BaseOptionDto? province, BaseOptionDto? ward, String? userId, String? departmentId, String? positionId, DateTime? createdAt, DateTime? updatedAt, UserDto? user, DepartmentDto? department, PositionDto? position
});


$BaseOptionDtoCopyWith<$Res>? get bank;$BaseOptionDtoCopyWith<$Res>? get province;$BaseOptionDtoCopyWith<$Res>? get ward;$UserDtoCopyWith<$Res>? get user;$DepartmentDtoCopyWith<$Res>? get department;$PositionDtoCopyWith<$Res>? get position;

}
/// @nodoc
class _$EmployeeDtoCopyWithImpl<$Res>
    implements $EmployeeDtoCopyWith<$Res> {
  _$EmployeeDtoCopyWithImpl(this._self, this._then);

  final EmployeeDto _self;
  final $Res Function(EmployeeDto) _then;

/// Create a copy of EmployeeDto
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? employeeId = null,Object? name = null,Object? email = null,Object? phone = freezed,Object? avatar = freezed,Object? status = null,Object? dateOfBirth = freezed,Object? gender = freezed,Object? address = freezed,Object? hireDate = freezed,Object? salary = freezed,Object? bankAccount = freezed,Object? bank = freezed,Object? maritalStatus = freezed,Object? nationality = freezed,Object? religion = freezed,Object? identityCardNumber = freezed,Object? identityCardIssueDate = freezed,Object? frontIdentityCardImage = freezed,Object? backIdentityCardImage = freezed,Object? province = freezed,Object? ward = freezed,Object? userId = freezed,Object? departmentId = freezed,Object? positionId = freezed,Object? createdAt = freezed,Object? updatedAt = freezed,Object? user = freezed,Object? department = freezed,Object? position = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,employeeId: null == employeeId ? _self.employeeId : employeeId // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,email: null == email ? _self.email : email // ignore: cast_nullable_to_non_nullable
as String,phone: freezed == phone ? _self.phone : phone // ignore: cast_nullable_to_non_nullable
as String?,avatar: freezed == avatar ? _self.avatar : avatar // ignore: cast_nullable_to_non_nullable
as String?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,dateOfBirth: freezed == dateOfBirth ? _self.dateOfBirth : dateOfBirth // ignore: cast_nullable_to_non_nullable
as DateTime?,gender: freezed == gender ? _self.gender : gender // ignore: cast_nullable_to_non_nullable
as String?,address: freezed == address ? _self.address : address // ignore: cast_nullable_to_non_nullable
as String?,hireDate: freezed == hireDate ? _self.hireDate : hireDate // ignore: cast_nullable_to_non_nullable
as DateTime?,salary: freezed == salary ? _self.salary : salary // ignore: cast_nullable_to_non_nullable
as String?,bankAccount: freezed == bankAccount ? _self.bankAccount : bankAccount // ignore: cast_nullable_to_non_nullable
as String?,bank: freezed == bank ? _self.bank : bank // ignore: cast_nullable_to_non_nullable
as BaseOptionDto?,maritalStatus: freezed == maritalStatus ? _self.maritalStatus : maritalStatus // ignore: cast_nullable_to_non_nullable
as String?,nationality: freezed == nationality ? _self.nationality : nationality // ignore: cast_nullable_to_non_nullable
as String?,religion: freezed == religion ? _self.religion : religion // ignore: cast_nullable_to_non_nullable
as String?,identityCardNumber: freezed == identityCardNumber ? _self.identityCardNumber : identityCardNumber // ignore: cast_nullable_to_non_nullable
as String?,identityCardIssueDate: freezed == identityCardIssueDate ? _self.identityCardIssueDate : identityCardIssueDate // ignore: cast_nullable_to_non_nullable
as DateTime?,frontIdentityCardImage: freezed == frontIdentityCardImage ? _self.frontIdentityCardImage : frontIdentityCardImage // ignore: cast_nullable_to_non_nullable
as String?,backIdentityCardImage: freezed == backIdentityCardImage ? _self.backIdentityCardImage : backIdentityCardImage // ignore: cast_nullable_to_non_nullable
as String?,province: freezed == province ? _self.province : province // ignore: cast_nullable_to_non_nullable
as BaseOptionDto?,ward: freezed == ward ? _self.ward : ward // ignore: cast_nullable_to_non_nullable
as BaseOptionDto?,userId: freezed == userId ? _self.userId : userId // ignore: cast_nullable_to_non_nullable
as String?,departmentId: freezed == departmentId ? _self.departmentId : departmentId // ignore: cast_nullable_to_non_nullable
as String?,positionId: freezed == positionId ? _self.positionId : positionId // ignore: cast_nullable_to_non_nullable
as String?,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime?,updatedAt: freezed == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,user: freezed == user ? _self.user : user // ignore: cast_nullable_to_non_nullable
as UserDto?,department: freezed == department ? _self.department : department // ignore: cast_nullable_to_non_nullable
as DepartmentDto?,position: freezed == position ? _self.position : position // ignore: cast_nullable_to_non_nullable
as PositionDto?,
  ));
}
/// Create a copy of EmployeeDto
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$BaseOptionDtoCopyWith<$Res>? get bank {
    if (_self.bank == null) {
    return null;
  }

  return $BaseOptionDtoCopyWith<$Res>(_self.bank!, (value) {
    return _then(_self.copyWith(bank: value));
  });
}/// Create a copy of EmployeeDto
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$BaseOptionDtoCopyWith<$Res>? get province {
    if (_self.province == null) {
    return null;
  }

  return $BaseOptionDtoCopyWith<$Res>(_self.province!, (value) {
    return _then(_self.copyWith(province: value));
  });
}/// Create a copy of EmployeeDto
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$BaseOptionDtoCopyWith<$Res>? get ward {
    if (_self.ward == null) {
    return null;
  }

  return $BaseOptionDtoCopyWith<$Res>(_self.ward!, (value) {
    return _then(_self.copyWith(ward: value));
  });
}/// Create a copy of EmployeeDto
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$UserDtoCopyWith<$Res>? get user {
    if (_self.user == null) {
    return null;
  }

  return $UserDtoCopyWith<$Res>(_self.user!, (value) {
    return _then(_self.copyWith(user: value));
  });
}/// Create a copy of EmployeeDto
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$DepartmentDtoCopyWith<$Res>? get department {
    if (_self.department == null) {
    return null;
  }

  return $DepartmentDtoCopyWith<$Res>(_self.department!, (value) {
    return _then(_self.copyWith(department: value));
  });
}/// Create a copy of EmployeeDto
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$PositionDtoCopyWith<$Res>? get position {
    if (_self.position == null) {
    return null;
  }

  return $PositionDtoCopyWith<$Res>(_self.position!, (value) {
    return _then(_self.copyWith(position: value));
  });
}
}


/// Adds pattern-matching-related methods to [EmployeeDto].
extension EmployeeDtoPatterns on EmployeeDto {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _EmployeeDto value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _EmployeeDto() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _EmployeeDto value)  $default,){
final _that = this;
switch (_that) {
case _EmployeeDto():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _EmployeeDto value)?  $default,){
final _that = this;
switch (_that) {
case _EmployeeDto() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String employeeId,  String name,  String email,  String? phone,  String? avatar,  String status,  DateTime? dateOfBirth,  String? gender,  String? address,  DateTime? hireDate,  String? salary,  String? bankAccount,  BaseOptionDto? bank,  String? maritalStatus,  String? nationality,  String? religion,  String? identityCardNumber,  DateTime? identityCardIssueDate,  String? frontIdentityCardImage,  String? backIdentityCardImage,  BaseOptionDto? province,  BaseOptionDto? ward,  String? userId,  String? departmentId,  String? positionId,  DateTime? createdAt,  DateTime? updatedAt,  UserDto? user,  DepartmentDto? department,  PositionDto? position)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _EmployeeDto() when $default != null:
return $default(_that.id,_that.employeeId,_that.name,_that.email,_that.phone,_that.avatar,_that.status,_that.dateOfBirth,_that.gender,_that.address,_that.hireDate,_that.salary,_that.bankAccount,_that.bank,_that.maritalStatus,_that.nationality,_that.religion,_that.identityCardNumber,_that.identityCardIssueDate,_that.frontIdentityCardImage,_that.backIdentityCardImage,_that.province,_that.ward,_that.userId,_that.departmentId,_that.positionId,_that.createdAt,_that.updatedAt,_that.user,_that.department,_that.position);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String employeeId,  String name,  String email,  String? phone,  String? avatar,  String status,  DateTime? dateOfBirth,  String? gender,  String? address,  DateTime? hireDate,  String? salary,  String? bankAccount,  BaseOptionDto? bank,  String? maritalStatus,  String? nationality,  String? religion,  String? identityCardNumber,  DateTime? identityCardIssueDate,  String? frontIdentityCardImage,  String? backIdentityCardImage,  BaseOptionDto? province,  BaseOptionDto? ward,  String? userId,  String? departmentId,  String? positionId,  DateTime? createdAt,  DateTime? updatedAt,  UserDto? user,  DepartmentDto? department,  PositionDto? position)  $default,) {final _that = this;
switch (_that) {
case _EmployeeDto():
return $default(_that.id,_that.employeeId,_that.name,_that.email,_that.phone,_that.avatar,_that.status,_that.dateOfBirth,_that.gender,_that.address,_that.hireDate,_that.salary,_that.bankAccount,_that.bank,_that.maritalStatus,_that.nationality,_that.religion,_that.identityCardNumber,_that.identityCardIssueDate,_that.frontIdentityCardImage,_that.backIdentityCardImage,_that.province,_that.ward,_that.userId,_that.departmentId,_that.positionId,_that.createdAt,_that.updatedAt,_that.user,_that.department,_that.position);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String employeeId,  String name,  String email,  String? phone,  String? avatar,  String status,  DateTime? dateOfBirth,  String? gender,  String? address,  DateTime? hireDate,  String? salary,  String? bankAccount,  BaseOptionDto? bank,  String? maritalStatus,  String? nationality,  String? religion,  String? identityCardNumber,  DateTime? identityCardIssueDate,  String? frontIdentityCardImage,  String? backIdentityCardImage,  BaseOptionDto? province,  BaseOptionDto? ward,  String? userId,  String? departmentId,  String? positionId,  DateTime? createdAt,  DateTime? updatedAt,  UserDto? user,  DepartmentDto? department,  PositionDto? position)?  $default,) {final _that = this;
switch (_that) {
case _EmployeeDto() when $default != null:
return $default(_that.id,_that.employeeId,_that.name,_that.email,_that.phone,_that.avatar,_that.status,_that.dateOfBirth,_that.gender,_that.address,_that.hireDate,_that.salary,_that.bankAccount,_that.bank,_that.maritalStatus,_that.nationality,_that.religion,_that.identityCardNumber,_that.identityCardIssueDate,_that.frontIdentityCardImage,_that.backIdentityCardImage,_that.province,_that.ward,_that.userId,_that.departmentId,_that.positionId,_that.createdAt,_that.updatedAt,_that.user,_that.department,_that.position);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _EmployeeDto implements EmployeeDto {
  const _EmployeeDto({required this.id, required this.employeeId, required this.name, required this.email, this.phone, this.avatar, required this.status, this.dateOfBirth, this.gender, this.address, this.hireDate, this.salary, this.bankAccount, this.bank, this.maritalStatus, this.nationality, this.religion, this.identityCardNumber, this.identityCardIssueDate, this.frontIdentityCardImage, this.backIdentityCardImage, this.province, this.ward, this.userId, this.departmentId, this.positionId, this.createdAt, this.updatedAt, this.user, this.department, this.position});
  factory _EmployeeDto.fromJson(Map<String, dynamic> json) => _$EmployeeDtoFromJson(json);

@override final  String id;
@override final  String employeeId;
@override final  String name;
@override final  String email;
@override final  String? phone;
@override final  String? avatar;
@override final  String status;
@override final  DateTime? dateOfBirth;
@override final  String? gender;
@override final  String? address;
@override final  DateTime? hireDate;
@override final  String? salary;
@override final  String? bankAccount;
@override final  BaseOptionDto? bank;
@override final  String? maritalStatus;
@override final  String? nationality;
@override final  String? religion;
@override final  String? identityCardNumber;
@override final  DateTime? identityCardIssueDate;
@override final  String? frontIdentityCardImage;
@override final  String? backIdentityCardImage;
@override final  BaseOptionDto? province;
@override final  BaseOptionDto? ward;
@override final  String? userId;
@override final  String? departmentId;
@override final  String? positionId;
@override final  DateTime? createdAt;
@override final  DateTime? updatedAt;
@override final  UserDto? user;
@override final  DepartmentDto? department;
@override final  PositionDto? position;

/// Create a copy of EmployeeDto
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$EmployeeDtoCopyWith<_EmployeeDto> get copyWith => __$EmployeeDtoCopyWithImpl<_EmployeeDto>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$EmployeeDtoToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _EmployeeDto&&(identical(other.id, id) || other.id == id)&&(identical(other.employeeId, employeeId) || other.employeeId == employeeId)&&(identical(other.name, name) || other.name == name)&&(identical(other.email, email) || other.email == email)&&(identical(other.phone, phone) || other.phone == phone)&&(identical(other.avatar, avatar) || other.avatar == avatar)&&(identical(other.status, status) || other.status == status)&&(identical(other.dateOfBirth, dateOfBirth) || other.dateOfBirth == dateOfBirth)&&(identical(other.gender, gender) || other.gender == gender)&&(identical(other.address, address) || other.address == address)&&(identical(other.hireDate, hireDate) || other.hireDate == hireDate)&&(identical(other.salary, salary) || other.salary == salary)&&(identical(other.bankAccount, bankAccount) || other.bankAccount == bankAccount)&&(identical(other.bank, bank) || other.bank == bank)&&(identical(other.maritalStatus, maritalStatus) || other.maritalStatus == maritalStatus)&&(identical(other.nationality, nationality) || other.nationality == nationality)&&(identical(other.religion, religion) || other.religion == religion)&&(identical(other.identityCardNumber, identityCardNumber) || other.identityCardNumber == identityCardNumber)&&(identical(other.identityCardIssueDate, identityCardIssueDate) || other.identityCardIssueDate == identityCardIssueDate)&&(identical(other.frontIdentityCardImage, frontIdentityCardImage) || other.frontIdentityCardImage == frontIdentityCardImage)&&(identical(other.backIdentityCardImage, backIdentityCardImage) || other.backIdentityCardImage == backIdentityCardImage)&&(identical(other.province, province) || other.province == province)&&(identical(other.ward, ward) || other.ward == ward)&&(identical(other.userId, userId) || other.userId == userId)&&(identical(other.departmentId, departmentId) || other.departmentId == departmentId)&&(identical(other.positionId, positionId) || other.positionId == positionId)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt)&&(identical(other.user, user) || other.user == user)&&(identical(other.department, department) || other.department == department)&&(identical(other.position, position) || other.position == position));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hashAll([runtimeType,id,employeeId,name,email,phone,avatar,status,dateOfBirth,gender,address,hireDate,salary,bankAccount,bank,maritalStatus,nationality,religion,identityCardNumber,identityCardIssueDate,frontIdentityCardImage,backIdentityCardImage,province,ward,userId,departmentId,positionId,createdAt,updatedAt,user,department,position]);

@override
String toString() {
  return 'EmployeeDto(id: $id, employeeId: $employeeId, name: $name, email: $email, phone: $phone, avatar: $avatar, status: $status, dateOfBirth: $dateOfBirth, gender: $gender, address: $address, hireDate: $hireDate, salary: $salary, bankAccount: $bankAccount, bank: $bank, maritalStatus: $maritalStatus, nationality: $nationality, religion: $religion, identityCardNumber: $identityCardNumber, identityCardIssueDate: $identityCardIssueDate, frontIdentityCardImage: $frontIdentityCardImage, backIdentityCardImage: $backIdentityCardImage, province: $province, ward: $ward, userId: $userId, departmentId: $departmentId, positionId: $positionId, createdAt: $createdAt, updatedAt: $updatedAt, user: $user, department: $department, position: $position)';
}


}

/// @nodoc
abstract mixin class _$EmployeeDtoCopyWith<$Res> implements $EmployeeDtoCopyWith<$Res> {
  factory _$EmployeeDtoCopyWith(_EmployeeDto value, $Res Function(_EmployeeDto) _then) = __$EmployeeDtoCopyWithImpl;
@override @useResult
$Res call({
 String id, String employeeId, String name, String email, String? phone, String? avatar, String status, DateTime? dateOfBirth, String? gender, String? address, DateTime? hireDate, String? salary, String? bankAccount, BaseOptionDto? bank, String? maritalStatus, String? nationality, String? religion, String? identityCardNumber, DateTime? identityCardIssueDate, String? frontIdentityCardImage, String? backIdentityCardImage, BaseOptionDto? province, BaseOptionDto? ward, String? userId, String? departmentId, String? positionId, DateTime? createdAt, DateTime? updatedAt, UserDto? user, DepartmentDto? department, PositionDto? position
});


@override $BaseOptionDtoCopyWith<$Res>? get bank;@override $BaseOptionDtoCopyWith<$Res>? get province;@override $BaseOptionDtoCopyWith<$Res>? get ward;@override $UserDtoCopyWith<$Res>? get user;@override $DepartmentDtoCopyWith<$Res>? get department;@override $PositionDtoCopyWith<$Res>? get position;

}
/// @nodoc
class __$EmployeeDtoCopyWithImpl<$Res>
    implements _$EmployeeDtoCopyWith<$Res> {
  __$EmployeeDtoCopyWithImpl(this._self, this._then);

  final _EmployeeDto _self;
  final $Res Function(_EmployeeDto) _then;

/// Create a copy of EmployeeDto
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? employeeId = null,Object? name = null,Object? email = null,Object? phone = freezed,Object? avatar = freezed,Object? status = null,Object? dateOfBirth = freezed,Object? gender = freezed,Object? address = freezed,Object? hireDate = freezed,Object? salary = freezed,Object? bankAccount = freezed,Object? bank = freezed,Object? maritalStatus = freezed,Object? nationality = freezed,Object? religion = freezed,Object? identityCardNumber = freezed,Object? identityCardIssueDate = freezed,Object? frontIdentityCardImage = freezed,Object? backIdentityCardImage = freezed,Object? province = freezed,Object? ward = freezed,Object? userId = freezed,Object? departmentId = freezed,Object? positionId = freezed,Object? createdAt = freezed,Object? updatedAt = freezed,Object? user = freezed,Object? department = freezed,Object? position = freezed,}) {
  return _then(_EmployeeDto(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,employeeId: null == employeeId ? _self.employeeId : employeeId // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,email: null == email ? _self.email : email // ignore: cast_nullable_to_non_nullable
as String,phone: freezed == phone ? _self.phone : phone // ignore: cast_nullable_to_non_nullable
as String?,avatar: freezed == avatar ? _self.avatar : avatar // ignore: cast_nullable_to_non_nullable
as String?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,dateOfBirth: freezed == dateOfBirth ? _self.dateOfBirth : dateOfBirth // ignore: cast_nullable_to_non_nullable
as DateTime?,gender: freezed == gender ? _self.gender : gender // ignore: cast_nullable_to_non_nullable
as String?,address: freezed == address ? _self.address : address // ignore: cast_nullable_to_non_nullable
as String?,hireDate: freezed == hireDate ? _self.hireDate : hireDate // ignore: cast_nullable_to_non_nullable
as DateTime?,salary: freezed == salary ? _self.salary : salary // ignore: cast_nullable_to_non_nullable
as String?,bankAccount: freezed == bankAccount ? _self.bankAccount : bankAccount // ignore: cast_nullable_to_non_nullable
as String?,bank: freezed == bank ? _self.bank : bank // ignore: cast_nullable_to_non_nullable
as BaseOptionDto?,maritalStatus: freezed == maritalStatus ? _self.maritalStatus : maritalStatus // ignore: cast_nullable_to_non_nullable
as String?,nationality: freezed == nationality ? _self.nationality : nationality // ignore: cast_nullable_to_non_nullable
as String?,religion: freezed == religion ? _self.religion : religion // ignore: cast_nullable_to_non_nullable
as String?,identityCardNumber: freezed == identityCardNumber ? _self.identityCardNumber : identityCardNumber // ignore: cast_nullable_to_non_nullable
as String?,identityCardIssueDate: freezed == identityCardIssueDate ? _self.identityCardIssueDate : identityCardIssueDate // ignore: cast_nullable_to_non_nullable
as DateTime?,frontIdentityCardImage: freezed == frontIdentityCardImage ? _self.frontIdentityCardImage : frontIdentityCardImage // ignore: cast_nullable_to_non_nullable
as String?,backIdentityCardImage: freezed == backIdentityCardImage ? _self.backIdentityCardImage : backIdentityCardImage // ignore: cast_nullable_to_non_nullable
as String?,province: freezed == province ? _self.province : province // ignore: cast_nullable_to_non_nullable
as BaseOptionDto?,ward: freezed == ward ? _self.ward : ward // ignore: cast_nullable_to_non_nullable
as BaseOptionDto?,userId: freezed == userId ? _self.userId : userId // ignore: cast_nullable_to_non_nullable
as String?,departmentId: freezed == departmentId ? _self.departmentId : departmentId // ignore: cast_nullable_to_non_nullable
as String?,positionId: freezed == positionId ? _self.positionId : positionId // ignore: cast_nullable_to_non_nullable
as String?,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime?,updatedAt: freezed == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,user: freezed == user ? _self.user : user // ignore: cast_nullable_to_non_nullable
as UserDto?,department: freezed == department ? _self.department : department // ignore: cast_nullable_to_non_nullable
as DepartmentDto?,position: freezed == position ? _self.position : position // ignore: cast_nullable_to_non_nullable
as PositionDto?,
  ));
}

/// Create a copy of EmployeeDto
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$BaseOptionDtoCopyWith<$Res>? get bank {
    if (_self.bank == null) {
    return null;
  }

  return $BaseOptionDtoCopyWith<$Res>(_self.bank!, (value) {
    return _then(_self.copyWith(bank: value));
  });
}/// Create a copy of EmployeeDto
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$BaseOptionDtoCopyWith<$Res>? get province {
    if (_self.province == null) {
    return null;
  }

  return $BaseOptionDtoCopyWith<$Res>(_self.province!, (value) {
    return _then(_self.copyWith(province: value));
  });
}/// Create a copy of EmployeeDto
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$BaseOptionDtoCopyWith<$Res>? get ward {
    if (_self.ward == null) {
    return null;
  }

  return $BaseOptionDtoCopyWith<$Res>(_self.ward!, (value) {
    return _then(_self.copyWith(ward: value));
  });
}/// Create a copy of EmployeeDto
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$UserDtoCopyWith<$Res>? get user {
    if (_self.user == null) {
    return null;
  }

  return $UserDtoCopyWith<$Res>(_self.user!, (value) {
    return _then(_self.copyWith(user: value));
  });
}/// Create a copy of EmployeeDto
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$DepartmentDtoCopyWith<$Res>? get department {
    if (_self.department == null) {
    return null;
  }

  return $DepartmentDtoCopyWith<$Res>(_self.department!, (value) {
    return _then(_self.copyWith(department: value));
  });
}/// Create a copy of EmployeeDto
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$PositionDtoCopyWith<$Res>? get position {
    if (_self.position == null) {
    return null;
  }

  return $PositionDtoCopyWith<$Res>(_self.position!, (value) {
    return _then(_self.copyWith(position: value));
  });
}
}

// dart format on
