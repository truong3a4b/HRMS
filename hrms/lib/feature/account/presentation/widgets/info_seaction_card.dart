import 'package:flutter/material.dart';

class InfoSectionCard extends StatelessWidget {
  final String title;
  final List<InfoItem> items;
  final bool canEdit;
  final void Function()? onEdit;

  const InfoSectionCard({
    required this.title,
    required this.items,
    this.canEdit = false,
    this.onEdit,
  });

  @override
  Widget build(BuildContext context) {
    const cardBorderColor = Color(0xFFE8E8E8);
    const titleColor = Color(0xFF2F2F2F);
    const editBg = Color(0xFFF1F7FB);
    const primaryColor = Color(0xFF0E67B2);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 18, 16, 18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: cardBorderColor),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: titleColor,
                  ),
                ),
              ),
              canEdit
                  ? Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: editBg,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: IconButton(
                        onPressed: onEdit,
                        icon: const Icon(
                          Icons.edit_outlined,
                          color: primaryColor,
                          size: 22,
                        ),
                      ),
                    )
                  : const SizedBox(),
            ],
          ),
          const SizedBox(height: 18),
          ...items.map((e) => _InfoRow(item: e)),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final InfoItem item;

  const _InfoRow({required this.item});

  @override
  Widget build(BuildContext context) {
    const labelColor = Color(0xFF9A9A9A);
    const valueColor = Color(0xFF333333);
    const primaryColor = Color(0xFF0E6BA8);

    return Padding(
      padding: const EdgeInsets.only(bottom: 18),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              item.label,
              style: const TextStyle(
                fontSize: 14,
                color: labelColor,
                fontWeight: FontWeight.w500,
                height: 1.35,
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    item.value,
                    style: const TextStyle(
                      fontSize: 14,
                      color: valueColor,
                      fontWeight: FontWeight.w600,
                      height: 1.35,
                    ),
                  ),
                ),
                if (item.trailingIcon != null) ...[
                  const SizedBox(width: 8),
                  InkWell(
                    onTap: () {},
                    borderRadius: BorderRadius.circular(8),
                    child: Padding(
                      padding: const EdgeInsets.all(2),
                      child: Icon(
                        item.trailingIcon,
                        size: 20,
                        color: primaryColor,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class InfoItem {
  final String label;
  final String value;
  final IconData? trailingIcon;

  const InfoItem({required this.label, required this.value, this.trailingIcon});
}
