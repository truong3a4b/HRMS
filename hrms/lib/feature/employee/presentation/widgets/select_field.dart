import 'package:flutter/material.dart';

class SelectField<T> extends StatefulWidget {
  final String title;
  final List<T> options;
  final T? value;
  final ValueChanged<T> onChanged;

  final String Function(T item) itemLabel;
  final bool Function(T a, T b)? isSameItem;

  const SelectField({
    super.key,
    required this.title,
    required this.options,
    required this.value,
    required this.onChanged,
    required this.itemLabel,
    this.isSameItem,
  });

  @override
  State<SelectField<T>> createState() => _SelectFieldState<T>();
}

class _SelectFieldState<T> extends State<SelectField<T>> {
  bool _isSelected(T item) {
    final value = widget.value;
    if (value == null) return false;

    if (widget.isSameItem != null) {
      return widget.isSameItem!(item, value);
    }

    return item == value;
  }

  Future<void> _showSelectBottomSheet() async {
    FocusManager.instance.primaryFocus?.unfocus();

    final selected = await showModalBottomSheet<T>(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          widget.title,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      IconButton(
                        onPressed: () => Navigator.pop(context),
                        icon: const Icon(Icons.close),
                      ),
                    ],
                  ),
                ),
                const Divider(height: 1, color: Color(0xC2BCBABA)),
                Flexible(
                  child: ListView.separated(
                    shrinkWrap: true,
                    itemCount: widget.options.length,
                    separatorBuilder: (_, __) =>
                    const Divider(height: 1, color: Color(0x99ECECEC)),
                    itemBuilder: (context, index) {
                      final item = widget.options[index];
                      final isSelected = _isSelected(item);

                      return ListTile(
                        title: Text(
                          widget.itemLabel(item),
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: isSelected
                                ? FontWeight.w600
                                : FontWeight.w400,
                            color: isSelected
                                ? const Color(0xFF1565C0)
                                : Colors.black,
                          ),
                        ),
                        trailing: isSelected
                            ? const Icon(Icons.check, color: Color(0xFF1565C0))
                            : null,
                        onTap: () => Navigator.pop(context, item),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );

    FocusManager.instance.primaryFocus?.unfocus();

    if (selected != null) {
      widget.onChanged(selected);
    }
  }

  @override
  Widget build(BuildContext context) {
    final hasValue = widget.value != null;

    return SizedBox(
      height: 54,
      child: InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: _showSelectBottomSheet,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: const Color(0xFFD8D8D8),
              width: 1.2,
            ),
            color: Colors.white,
          ),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  hasValue ? widget.itemLabel(widget.value as T) : widget.title,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w400,
                    color: hasValue
                        ? const Color(0xFF000000)
                        : const Color(0xFF9E9E9E),
                  ),
                ),
              ),
              const Icon(
                Icons.keyboard_arrow_down_rounded,
                size: 28,
                color: Color(0xFF0E67B2),
              ),
            ],
          ),
        ),
      ),
    );
  }
}