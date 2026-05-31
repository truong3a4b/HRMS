class Holiday {
  final String id;
  final String name;
  final DateTime? date;
  final double salaryMultiplier;
  final String? description;
  final bool isActive;

  const Holiday({
    required this.id,
    required this.name,
    this.date,
    required this.salaryMultiplier,
    this.description,
    required this.isActive,
  });
}

class PayrollSummary {
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

  const PayrollSummary({
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
}

class PayrollLine {
  final String id;
  final String name;
  final double amount;
  final String? note;
  final bool isBonus;

  const PayrollLine({
    required this.id,
    required this.name,
    required this.amount,
    this.note,
    this.isBonus = true,
  });
}

class PayrollDetail extends PayrollSummary {
  final List<PayrollLine> allowanceLines;
  final List<PayrollLine> bonusPenaltyLines;
  final List<PayrollLine> overtimeLines;

  const PayrollDetail({
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
}

class BonusPenalty {
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

  const BonusPenalty({
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
}

extension PayrollStatusX on String {
  String get payrollStatusLabel {
    switch (this) {
      case 'DRAFT':
        return 'Nháp';
      case 'WAITING_APPROVAL':
        return 'Chờ duyệt';
      case 'APPROVED':
        return 'Đã duyệt';
      case 'PARTIALLY_PAID':
        return 'Thanh toán một phần';
      case 'PAID':
        return 'Đã thanh toán';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return this;
    }
  }
}
