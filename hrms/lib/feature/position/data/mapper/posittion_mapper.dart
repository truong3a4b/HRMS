import '../../domain/position.dart';
import '../models/position_dto.dart';

extension PositionMapper on PositionDto {
  Position toEntity() {
    return Position(
      id: id,
      name: name,
      code: code,
      description: description,
    );
  }
}