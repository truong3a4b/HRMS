import '../../domain/entities/payroll.dart';
import '../models/payroll_dto.dart';

extension HolidayMapper on HolidayDto {
  Holiday toEntity() {
    return Holiday(
      id: id,
      name: name,
      date: date,
      salaryMultiplier: salaryMultiplier,
      description: description,
      isActive: isActive,
    );
  }
}

extension PayrollSummaryMapper on PayrollSummaryDto {
  PayrollSummary toEntity() {
    return PayrollSummary(
      id: id,
      month: month,
      year: year,
      baseSalary: baseSalary,
      actualWorkDays: actualWorkDays,
      grossSalary: grossSalary,
      totalDeduction: totalDeduction,
      totalBonus: totalBonus,
      totalPenalty: totalPenalty,
      netSalary: netSalary,
      paidAmount: paidAmount,
      remainingAmount: remainingAmount,
      status: status,
      generatedAt: generatedAt,
      approvedAt: approvedAt,
      paidAt: paidAt,
    );
  }
}

extension PayrollLineMapper on PayrollLineDto {
  PayrollLine toEntity() {
    return PayrollLine(
      id: id,
      name: name,
      amount: amount,
      note: note,
      isBonus: isBonus,
    );
  }
}

extension PayrollDetailMapper on PayrollDetailDto {
  PayrollDetail toEntity() {
    return PayrollDetail(
      id: id,
      month: month,
      year: year,
      baseSalary: baseSalary,
      actualWorkDays: actualWorkDays,
      grossSalary: grossSalary,
      totalDeduction: totalDeduction,
      totalBonus: totalBonus,
      totalPenalty: totalPenalty,
      netSalary: netSalary,
      paidAmount: paidAmount,
      remainingAmount: remainingAmount,
      status: status,
      generatedAt: generatedAt,
      approvedAt: approvedAt,
      paidAt: paidAt,
      allowanceLines: allowanceLines.map((line) => line.toEntity()).toList(),
      bonusPenaltyLines: bonusPenaltyLines
          .map((line) => line.toEntity())
          .toList(),
      overtimeLines: overtimeLines.map((line) => line.toEntity()).toList(),
    );
  }
}

extension BonusPenaltyMapper on BonusPenaltyDto {
  BonusPenalty toEntity() {
    return BonusPenalty(
      id: id,
      month: month,
      amount: amount,
      isBonus: isBonus,
      reason: reason,
      source: source,
      status: status,
      violationCount: violationCount,
      createdAt: createdAt,
      autoPolicyName: autoPolicyName,
    );
  }
}
