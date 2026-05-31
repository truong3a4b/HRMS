class HolidayDto {
  final String id;
  final String name;
  final DateTime? date;
  final double salaryMultiplier;
  final String? description;
  final bool isActive;

  const HolidayDto({
    required this.id,
    required this.name,
    this.date,
    required this.salaryMultiplier,
    this.description,
    required this.isActive,
  });

  factory HolidayDto.fromJson(Map<String, dynamic> json) {
    return HolidayDto(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      date: _toDate(json['date']),
      salaryMultiplier: _toDouble(json['salaryMultiplier']),
      description: json['description'] as String?,
      isActive: json['isActive'] as bool? ?? false,
    );
  }
}

class PayrollSummaryDto {
  final String id;
  final int month;
  final int year;
  final double baseSalary;
  final double actualWorkDays;
  final double grossSalary;
  final double totalDeduction;
  final double totalBonus;
  final double totalPenalty;
  final double netSalary;
  final double paidAmount;
  final double remainingAmount;
  final String status;
  final DateTime? generatedAt;
  final DateTime? approvedAt;
  final DateTime? paidAt;

  const PayrollSummaryDto({
    required this.id,
    required this.month,
    required this.year,
    required this.baseSalary,
    required this.actualWorkDays,
    required this.grossSalary,
    required this.totalDeduction,
    required this.totalBonus,
    required this.totalPenalty,
    required this.netSalary,
    required this.paidAmount,
    required this.remainingAmount,
    required this.status,
    this.generatedAt,
    this.approvedAt,
    this.paidAt,
  });

  factory PayrollSummaryDto.fromJson(Map<String, dynamic> json) {
    return PayrollSummaryDto(
      id: json['id'] as String? ?? '',
      month: json['month'] as int? ?? 0,
      year: json['year'] as int? ?? 0,
      baseSalary: _toDouble(json['baseSalary']),
      actualWorkDays: _toDouble(json['actualWorkDays']),
      grossSalary: _toDouble(json['grossSalary']),
      totalDeduction: _toDouble(json['totalDeduction']),
      totalBonus: _toDouble(json['totalBonus']),
      totalPenalty: _toDouble(json['totalPenalty']),
      netSalary: _toDouble(json['netSalary']),
      paidAmount: _toDouble(json['paidAmount']),
      remainingAmount: _toDouble(json['remainingAmount']),
      status: json['status'] as String? ?? '',
      generatedAt: _toDate(json['generatedAt']),
      approvedAt: _toDate(json['approvedAt']),
      paidAt: _toDate(json['paidAt']),
    );
  }
}

class PayrollLineDto {
  final String id;
  final String name;
  final double amount;
  final String? note;
  final bool isBonus;

  const PayrollLineDto({
    required this.id,
    required this.name,
    required this.amount,
    this.note,
    required this.isBonus,
  });

  factory PayrollLineDto.allowance(Map<String, dynamic> json) {
    return PayrollLineDto(
      id: json['id'] as String? ?? '',
      name: json['allowanceName'] as String? ?? 'Phụ cấp',
      amount: _toDouble(json['amount']),
      isBonus: true,
    );
  }

  factory PayrollLineDto.overtime(Map<String, dynamic> json) {
    return PayrollLineDto(
      id: json['id'] as String? ?? '',
      name: json['workShiftName'] as String? ?? 'Tăng ca',
      amount: _toDouble(json['amount']),
      note:
          '${_toDouble(json['workDays'])} công, ${_toDouble(json['hours'])} giờ',
      isBonus: true,
    );
  }

  factory PayrollLineDto.bonusPenalty(Map<String, dynamic> json) {
    final related = json['payrollBonusPenalty'] as Map<String, dynamic>?;
    final isBonus =
        json['isBonus'] as bool? ?? related?['isBonus'] as bool? ?? true;
    return PayrollLineDto(
      id: json['id'] as String? ?? '',
      name: isBonus ? 'Thưởng' : 'Phạt',
      amount: _toDouble(json['amount']),
      note: json['reason'] as String? ?? related?['reason'] as String?,
      isBonus: isBonus,
    );
  }
}

class PayrollDetailDto extends PayrollSummaryDto {
  final List<PayrollLineDto> allowanceLines;
  final List<PayrollLineDto> bonusPenaltyLines;
  final List<PayrollLineDto> overtimeLines;

  const PayrollDetailDto({
    required super.id,
    required super.month,
    required super.year,
    required super.baseSalary,
    required super.actualWorkDays,
    required super.grossSalary,
    required super.totalDeduction,
    required super.totalBonus,
    required super.totalPenalty,
    required super.netSalary,
    required super.paidAmount,
    required super.remainingAmount,
    required super.status,
    super.generatedAt,
    super.approvedAt,
    super.paidAt,
    required this.allowanceLines,
    required this.bonusPenaltyLines,
    required this.overtimeLines,
  });

  factory PayrollDetailDto.fromJson(Map<String, dynamic> json) {
    final base = PayrollSummaryDto.fromJson(json);
    return PayrollDetailDto(
      id: base.id,
      month: base.month,
      year: base.year,
      baseSalary: base.baseSalary,
      actualWorkDays: base.actualWorkDays,
      grossSalary: base.grossSalary,
      totalDeduction: base.totalDeduction,
      totalBonus: base.totalBonus,
      totalPenalty: base.totalPenalty,
      netSalary: base.netSalary,
      paidAmount: base.paidAmount,
      remainingAmount: base.remainingAmount,
      status: base.status,
      generatedAt: base.generatedAt,
      approvedAt: base.approvedAt,
      paidAt: base.paidAt,
      allowanceLines: (json['allowanceLines'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map(PayrollLineDto.allowance)
          .toList(),
      bonusPenaltyLines:
          (json['bonusPenaltyLines'] as List<dynamic>? ?? const [])
              .whereType<Map<String, dynamic>>()
              .map(PayrollLineDto.bonusPenalty)
              .toList(),
      overtimeLines: (json['overtimeLines'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map(PayrollLineDto.overtime)
          .toList(),
    );
  }
}

class BonusPenaltyDto {
  final String id;
  final DateTime? month;
  final double amount;
  final bool isBonus;
  final String? reason;
  final String source;
  final String status;
  final int? violationCount;
  final DateTime? createdAt;
  final String? autoPolicyName;

  const BonusPenaltyDto({
    required this.id,
    this.month,
    required this.amount,
    required this.isBonus,
    this.reason,
    required this.source,
    required this.status,
    this.violationCount,
    this.createdAt,
    this.autoPolicyName,
  });

  factory BonusPenaltyDto.fromJson(Map<String, dynamic> json) {
    final policy = json['autoPenaltyPolicy'] as Map<String, dynamic>?;
    return BonusPenaltyDto(
      id: json['id'] as String? ?? '',
      month: _toDate(json['month']),
      amount: _toDouble(json['amount']),
      isBonus: json['isBonus'] as bool? ?? false,
      reason: json['reason'] as String?,
      source: json['source'] as String? ?? '',
      status: json['status'] as String? ?? '',
      violationCount: json['violationCount'] as int?,
      createdAt: _toDate(json['createdAt']),
      autoPolicyName: policy?['name'] as String?,
    );
  }
}

DateTime? _toDate(dynamic value) {
  if (value == null) return null;
  if (value is DateTime) return value;
  if (value is String) return DateTime.tryParse(value)?.toLocal();
  return null;
}

double _toDouble(dynamic value) {
  if (value == null) return 0;
  if (value is num) return value.toDouble();
  if (value is String) return double.tryParse(value) ?? 0;
  return 0;
}
