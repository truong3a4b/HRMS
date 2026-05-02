import 'package:flutter/material.dart';
import 'package:hrms/core/widget/search_box.dart';

class SelectField<T> extends StatefulWidget {
  final String title;
  final List<T> options;
  final T? value;
  final bool isSearchable;
  final ValueChanged<T> onChanged;

  final String Function(T item) itemLabel;
  final bool Function(T a, T b)? isSameItem;

  const SelectField({
    super.key,
    required this.title,
    required this.options,
    required this.value,
    this.isSearchable = false,
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
                            fontSize: 15,
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

  Future<void> _showSearchableSelectBottomSheet() async {
    FocusManager.instance.primaryFocus?.unfocus();

    final TextEditingController controller = TextEditingController();
    List<T> filteredOptions = List.from(widget.options);

    final selected = await showModalBottomSheet<T>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return _SearchableBottomSheet<T>(
          title: widget.title,
          options: filteredOptions,
          itemLabel: widget.itemLabel,
          value: widget.value,
        );
      },
    );

    controller.dispose();
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
        borderRadius: BorderRadius.circular(12),
        onTap: widget.isSearchable
            ? _showSearchableSelectBottomSheet
            : _showSelectBottomSheet,
        child: InputDecorator(
          isEmpty: !hasValue,
          decoration: InputDecoration(
            labelText: widget.title,
            floatingLabelBehavior: FloatingLabelBehavior.auto,
            labelStyle: const TextStyle(
              color: Color(0xFF9E9E9E),
              fontSize: 15,
            ),
            floatingLabelStyle: const TextStyle(
              color: Color(0xFF0E67B2),
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
            suffixIcon: const Icon(
              Icons.keyboard_arrow_down_rounded,
              size: 28,
              color: Color(0xFF0E67B2),
            ),
            filled: true,
            fillColor: Colors.white,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 14,
              vertical: 16,
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(
                color: Color(0xFFD8D8D8),
                width: 1.2,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(
                color: Color(0xFF0E67B2),
                width: 1.2,
              ),
            ),
          ),
          child: Text(
            hasValue ? widget.itemLabel(widget.value as T) : '',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w400,
              color: hasValue
                  ? const Color(0xFF000000)
                  : const Color(0xFF9E9E9E),
            ),
          ),
        ),
      ),
    );
  }
}

class _SearchableBottomSheet<T> extends StatefulWidget {
  final String title;
  final List<T> options;
  final String Function(T) itemLabel;
  final T? value;
  final bool Function(T, T)? isSameItem;

  const _SearchableBottomSheet({
    super.key,
    required this.title,
    required this.options,
    required this.itemLabel,
    required this.value,
    this.isSameItem,
  });

  @override
  State<_SearchableBottomSheet<T>> createState() =>
      _SearchableBottomSheetState<T>();
}

class _SearchableBottomSheetState<T> extends State<_SearchableBottomSheet<T>> {
  late TextEditingController controller;
  late List<T> filtered;

  @override
  void initState() {
    super.initState();
    controller = TextEditingController();
    filtered = List.from(widget.options);
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  bool isSelected(T item) {
    final value = widget.value;
    if (value == null) return false;

    if (widget.isSameItem != null) {
      return widget.isSameItem!(item, value);
    }
    return item == value;
  }
  String normalizeText(String input) {
    return input
        .toLowerCase()
        .trim()
        .replaceAll(RegExp(r'[àáạảãâầấậẩẫăằắặẳẵ]'), 'a')
        .replaceAll(RegExp(r'[èéẹẻẽêềếệểễ]'), 'e')
        .replaceAll(RegExp(r'[ìíịỉĩ]'), 'i')
        .replaceAll(RegExp(r'[òóọỏõôồốộổỗơờớợởỡ]'), 'o')
        .replaceAll(RegExp(r'[ùúụủũưừứựửữ]'), 'u')
        .replaceAll(RegExp(r'[ỳýỵỷỹ]'), 'y')
        .replaceAll(RegExp(r'đ'), 'd')
        .replaceAll(RegExp(r'\s+'), ' ');
  }
  void onSearch(String value) {
    final keyword = normalizeText(value);

    if (keyword.isEmpty) {
      setState(() {
        filtered = List.from(widget.options);
      });
      return;
    }

    final startsWithList = <T>[];
    final containsList = <T>[];

    for (final e in widget.options) {
      final label = normalizeText(widget.itemLabel(e));

      if (label.startsWith(keyword)) {
        startsWithList.add(e);
      } else if (label.contains(keyword)) {
        containsList.add(e);
      }
    }

    setState(() {
      filtered = [...startsWithList, ...containsList];
    });
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    return AnimatedPadding(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOut,
        padding: EdgeInsets.only(bottom: bottomInset),
        child:
      DraggableScrollableSheet(
      expand: false,
      snap: false,
      initialChildSize: 0.6,
      minChildSize: 0.6,
      maxChildSize: 0.9,
      builder: (context, scrollController) {
        return  Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
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
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                child: SearchBox(
                  controller: controller,
                  hintText: 'Tìm kiếm...',
                  onChanged: onSearch,
                ),
              ),

              Expanded(
                child: ListView.separated(
                  itemCount: filtered.length,
                  separatorBuilder: (_, __) =>
                      const Divider(height: 1, color: Color(0x99ECECEC)),
                  itemBuilder: (_, i) {
                    final item = filtered[i];
                    final selected = isSelected(item);

                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: ListTile(
                        title: Text(
                          widget.itemLabel(item),
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: selected
                                ? FontWeight.w600
                                : FontWeight.w400,
                            color: selected
                                ? const Color(0xFF1565C0)
                                : Colors.black,
                          ),
                        ),
                        trailing: selected ? Icon(Icons.check) : null,
                        onTap: () => Navigator.pop(context, item),
                      ),
                    );
                  },
                ),
              ),

              const SizedBox(height: 16),
            ],
          ),
        );
      },
    )
    );
  }
}
