// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'recruitment_job_dto.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$RecruitmentJobDto {

 String get id; String get title; String? get description; String? get requirements; String? get benefits; String? get salaryMin; String? get salaryMax; int? get quantity; DateTime? get deadline; String get status; String? get positionId; String? get departmentId; PositionDto? get position; DepartmentDto? get department; DateTime? get createdAt; DateTime? get updatedAt; bool? get applied;
/// Create a copy of RecruitmentJobDto
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$RecruitmentJobDtoCopyWith<RecruitmentJobDto> get copyWith => _$RecruitmentJobDtoCopyWithImpl<RecruitmentJobDto>(this as RecruitmentJobDto, _$identity);

  /// Serializes this RecruitmentJobDto to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is RecruitmentJobDto&&(identical(other.id, id) || other.id == id)&&(identical(other.title, title) || other.title == title)&&(identical(other.description, description) || other.description == description)&&(identical(other.requirements, requirements) || other.requirements == requirements)&&(identical(other.benefits, benefits) || other.benefits == benefits)&&(identical(other.salaryMin, salaryMin) || other.salaryMin == salaryMin)&&(identical(other.salaryMax, salaryMax) || other.salaryMax == salaryMax)&&(identical(other.quantity, quantity) || other.quantity == quantity)&&(identical(other.deadline, deadline) || other.deadline == deadline)&&(identical(other.status, status) || other.status == status)&&(identical(other.positionId, positionId) || other.positionId == positionId)&&(identical(other.departmentId, departmentId) || other.departmentId == departmentId)&&(identical(other.position, position) || other.position == position)&&(identical(other.department, department) || other.department == department)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt)&&(identical(other.applied, applied) || other.applied == applied));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,title,description,requirements,benefits,salaryMin,salaryMax,quantity,deadline,status,positionId,departmentId,position,department,createdAt,updatedAt,applied);

@override
String toString() {
  return 'RecruitmentJobDto(id: $id, title: $title, description: $description, requirements: $requirements, benefits: $benefits, salaryMin: $salaryMin, salaryMax: $salaryMax, quantity: $quantity, deadline: $deadline, status: $status, positionId: $positionId, departmentId: $departmentId, position: $position, department: $department, createdAt: $createdAt, updatedAt: $updatedAt, applied: $applied)';
}


}

/// @nodoc
abstract mixin class $RecruitmentJobDtoCopyWith<$Res>  {
  factory $RecruitmentJobDtoCopyWith(RecruitmentJobDto value, $Res Function(RecruitmentJobDto) _then) = _$RecruitmentJobDtoCopyWithImpl;
@useResult
$Res call({
 String id, String title, String? description, String? requirements, String? benefits, String? salaryMin, String? salaryMax, int? quantity, DateTime? deadline, String status, String? positionId, String? departmentId, PositionDto? position, DepartmentDto? department, DateTime? createdAt, DateTime? updatedAt, bool? applied
});


$PositionDtoCopyWith<$Res>? get position;$DepartmentDtoCopyWith<$Res>? get department;

}
/// @nodoc
class _$RecruitmentJobDtoCopyWithImpl<$Res>
    implements $RecruitmentJobDtoCopyWith<$Res> {
  _$RecruitmentJobDtoCopyWithImpl(this._self, this._then);

  final RecruitmentJobDto _self;
  final $Res Function(RecruitmentJobDto) _then;

/// Create a copy of RecruitmentJobDto
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? title = null,Object? description = freezed,Object? requirements = freezed,Object? benefits = freezed,Object? salaryMin = freezed,Object? salaryMax = freezed,Object? quantity = freezed,Object? deadline = freezed,Object? status = null,Object? positionId = freezed,Object? departmentId = freezed,Object? position = freezed,Object? department = freezed,Object? createdAt = freezed,Object? updatedAt = freezed,Object? applied = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,description: freezed == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String?,requirements: freezed == requirements ? _self.requirements : requirements // ignore: cast_nullable_to_non_nullable
as String?,benefits: freezed == benefits ? _self.benefits : benefits // ignore: cast_nullable_to_non_nullable
as String?,salaryMin: freezed == salaryMin ? _self.salaryMin : salaryMin // ignore: cast_nullable_to_non_nullable
as String?,salaryMax: freezed == salaryMax ? _self.salaryMax : salaryMax // ignore: cast_nullable_to_non_nullable
as String?,quantity: freezed == quantity ? _self.quantity : quantity // ignore: cast_nullable_to_non_nullable
as int?,deadline: freezed == deadline ? _self.deadline : deadline // ignore: cast_nullable_to_non_nullable
as DateTime?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,positionId: freezed == positionId ? _self.positionId : positionId // ignore: cast_nullable_to_non_nullable
as String?,departmentId: freezed == departmentId ? _self.departmentId : departmentId // ignore: cast_nullable_to_non_nullable
as String?,position: freezed == position ? _self.position : position // ignore: cast_nullable_to_non_nullable
as PositionDto?,department: freezed == department ? _self.department : department // ignore: cast_nullable_to_non_nullable
as DepartmentDto?,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime?,updatedAt: freezed == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,applied: freezed == applied ? _self.applied : applied // ignore: cast_nullable_to_non_nullable
as bool?,
  ));
}
/// Create a copy of RecruitmentJobDto
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
}/// Create a copy of RecruitmentJobDto
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
}
}


/// Adds pattern-matching-related methods to [RecruitmentJobDto].
extension RecruitmentJobDtoPatterns on RecruitmentJobDto {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _RecruitmentJobDto value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _RecruitmentJobDto() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _RecruitmentJobDto value)  $default,){
final _that = this;
switch (_that) {
case _RecruitmentJobDto():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _RecruitmentJobDto value)?  $default,){
final _that = this;
switch (_that) {
case _RecruitmentJobDto() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String title,  String? description,  String? requirements,  String? benefits,  String? salaryMin,  String? salaryMax,  int? quantity,  DateTime? deadline,  String status,  String? positionId,  String? departmentId,  PositionDto? position,  DepartmentDto? department,  DateTime? createdAt,  DateTime? updatedAt,  bool? applied)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _RecruitmentJobDto() when $default != null:
return $default(_that.id,_that.title,_that.description,_that.requirements,_that.benefits,_that.salaryMin,_that.salaryMax,_that.quantity,_that.deadline,_that.status,_that.positionId,_that.departmentId,_that.position,_that.department,_that.createdAt,_that.updatedAt,_that.applied);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String title,  String? description,  String? requirements,  String? benefits,  String? salaryMin,  String? salaryMax,  int? quantity,  DateTime? deadline,  String status,  String? positionId,  String? departmentId,  PositionDto? position,  DepartmentDto? department,  DateTime? createdAt,  DateTime? updatedAt,  bool? applied)  $default,) {final _that = this;
switch (_that) {
case _RecruitmentJobDto():
return $default(_that.id,_that.title,_that.description,_that.requirements,_that.benefits,_that.salaryMin,_that.salaryMax,_that.quantity,_that.deadline,_that.status,_that.positionId,_that.departmentId,_that.position,_that.department,_that.createdAt,_that.updatedAt,_that.applied);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String title,  String? description,  String? requirements,  String? benefits,  String? salaryMin,  String? salaryMax,  int? quantity,  DateTime? deadline,  String status,  String? positionId,  String? departmentId,  PositionDto? position,  DepartmentDto? department,  DateTime? createdAt,  DateTime? updatedAt,  bool? applied)?  $default,) {final _that = this;
switch (_that) {
case _RecruitmentJobDto() when $default != null:
return $default(_that.id,_that.title,_that.description,_that.requirements,_that.benefits,_that.salaryMin,_that.salaryMax,_that.quantity,_that.deadline,_that.status,_that.positionId,_that.departmentId,_that.position,_that.department,_that.createdAt,_that.updatedAt,_that.applied);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _RecruitmentJobDto implements RecruitmentJobDto {
  const _RecruitmentJobDto({required this.id, required this.title, this.description, this.requirements, this.benefits, this.salaryMin, this.salaryMax, this.quantity, this.deadline, required this.status, this.positionId, this.departmentId, this.position, this.department, this.createdAt, this.updatedAt, this.applied});
  factory _RecruitmentJobDto.fromJson(Map<String, dynamic> json) => _$RecruitmentJobDtoFromJson(json);

@override final  String id;
@override final  String title;
@override final  String? description;
@override final  String? requirements;
@override final  String? benefits;
@override final  String? salaryMin;
@override final  String? salaryMax;
@override final  int? quantity;
@override final  DateTime? deadline;
@override final  String status;
@override final  String? positionId;
@override final  String? departmentId;
@override final  PositionDto? position;
@override final  DepartmentDto? department;
@override final  DateTime? createdAt;
@override final  DateTime? updatedAt;
@override final  bool? applied;

/// Create a copy of RecruitmentJobDto
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$RecruitmentJobDtoCopyWith<_RecruitmentJobDto> get copyWith => __$RecruitmentJobDtoCopyWithImpl<_RecruitmentJobDto>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$RecruitmentJobDtoToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _RecruitmentJobDto&&(identical(other.id, id) || other.id == id)&&(identical(other.title, title) || other.title == title)&&(identical(other.description, description) || other.description == description)&&(identical(other.requirements, requirements) || other.requirements == requirements)&&(identical(other.benefits, benefits) || other.benefits == benefits)&&(identical(other.salaryMin, salaryMin) || other.salaryMin == salaryMin)&&(identical(other.salaryMax, salaryMax) || other.salaryMax == salaryMax)&&(identical(other.quantity, quantity) || other.quantity == quantity)&&(identical(other.deadline, deadline) || other.deadline == deadline)&&(identical(other.status, status) || other.status == status)&&(identical(other.positionId, positionId) || other.positionId == positionId)&&(identical(other.departmentId, departmentId) || other.departmentId == departmentId)&&(identical(other.position, position) || other.position == position)&&(identical(other.department, department) || other.department == department)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt)&&(identical(other.applied, applied) || other.applied == applied));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,title,description,requirements,benefits,salaryMin,salaryMax,quantity,deadline,status,positionId,departmentId,position,department,createdAt,updatedAt,applied);

@override
String toString() {
  return 'RecruitmentJobDto(id: $id, title: $title, description: $description, requirements: $requirements, benefits: $benefits, salaryMin: $salaryMin, salaryMax: $salaryMax, quantity: $quantity, deadline: $deadline, status: $status, positionId: $positionId, departmentId: $departmentId, position: $position, department: $department, createdAt: $createdAt, updatedAt: $updatedAt, applied: $applied)';
}


}

/// @nodoc
abstract mixin class _$RecruitmentJobDtoCopyWith<$Res> implements $RecruitmentJobDtoCopyWith<$Res> {
  factory _$RecruitmentJobDtoCopyWith(_RecruitmentJobDto value, $Res Function(_RecruitmentJobDto) _then) = __$RecruitmentJobDtoCopyWithImpl;
@override @useResult
$Res call({
 String id, String title, String? description, String? requirements, String? benefits, String? salaryMin, String? salaryMax, int? quantity, DateTime? deadline, String status, String? positionId, String? departmentId, PositionDto? position, DepartmentDto? department, DateTime? createdAt, DateTime? updatedAt, bool? applied
});


@override $PositionDtoCopyWith<$Res>? get position;@override $DepartmentDtoCopyWith<$Res>? get department;

}
/// @nodoc
class __$RecruitmentJobDtoCopyWithImpl<$Res>
    implements _$RecruitmentJobDtoCopyWith<$Res> {
  __$RecruitmentJobDtoCopyWithImpl(this._self, this._then);

  final _RecruitmentJobDto _self;
  final $Res Function(_RecruitmentJobDto) _then;

/// Create a copy of RecruitmentJobDto
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? title = null,Object? description = freezed,Object? requirements = freezed,Object? benefits = freezed,Object? salaryMin = freezed,Object? salaryMax = freezed,Object? quantity = freezed,Object? deadline = freezed,Object? status = null,Object? positionId = freezed,Object? departmentId = freezed,Object? position = freezed,Object? department = freezed,Object? createdAt = freezed,Object? updatedAt = freezed,Object? applied = freezed,}) {
  return _then(_RecruitmentJobDto(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,description: freezed == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String?,requirements: freezed == requirements ? _self.requirements : requirements // ignore: cast_nullable_to_non_nullable
as String?,benefits: freezed == benefits ? _self.benefits : benefits // ignore: cast_nullable_to_non_nullable
as String?,salaryMin: freezed == salaryMin ? _self.salaryMin : salaryMin // ignore: cast_nullable_to_non_nullable
as String?,salaryMax: freezed == salaryMax ? _self.salaryMax : salaryMax // ignore: cast_nullable_to_non_nullable
as String?,quantity: freezed == quantity ? _self.quantity : quantity // ignore: cast_nullable_to_non_nullable
as int?,deadline: freezed == deadline ? _self.deadline : deadline // ignore: cast_nullable_to_non_nullable
as DateTime?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,positionId: freezed == positionId ? _self.positionId : positionId // ignore: cast_nullable_to_non_nullable
as String?,departmentId: freezed == departmentId ? _self.departmentId : departmentId // ignore: cast_nullable_to_non_nullable
as String?,position: freezed == position ? _self.position : position // ignore: cast_nullable_to_non_nullable
as PositionDto?,department: freezed == department ? _self.department : department // ignore: cast_nullable_to_non_nullable
as DepartmentDto?,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime?,updatedAt: freezed == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,applied: freezed == applied ? _self.applied : applied // ignore: cast_nullable_to_non_nullable
as bool?,
  ));
}

/// Create a copy of RecruitmentJobDto
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
}/// Create a copy of RecruitmentJobDto
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
}
}

// dart format on
