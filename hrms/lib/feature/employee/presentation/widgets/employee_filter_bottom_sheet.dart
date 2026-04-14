import 'package:flutter/material.dart';

class FilterOption {
  final String value;
  final String label;

  FilterOption({required this.value, required this.label});
}

class FilterItem {
  final String key;
  final String title;
  final List<FilterOption> options;
  final bool isMulti;

  FilterItem({
    required this.key,
    required this.title,
    required this.options,
    this.isMulti = false,
  });
}

class FilterResult {
  final Map<String, dynamic> values;

  FilterResult(this.values);

  dynamic operator [](String key) => values[key];

  void operator []=(String key, FilterOption value) {
    values[key] = value;
  }
}

class EmployeeFilterBottomSheet extends StatefulWidget {
  List<FilterItem> filters;
  FilterResult? filterResult;

  EmployeeFilterBottomSheet({super.key, required this.filters, this.filterResult});

  @override
  State<EmployeeFilterBottomSheet> createState() =>
      _EmployeeFilterBottomSheetState();
}

class _EmployeeFilterBottomSheetState extends State<EmployeeFilterBottomSheet> {
  final Map<String, dynamic> selectedValues = {};


  @override
  void initState() {
    super.initState();
    if(widget.filterResult != null) {
      selectedValues.addAll(widget.filterResult!.values);
      print("Selected values from filter result:");
      print(selectedValues);
    } else {
      print("No filter result provided, initializing with default values.");
      for (var filter in widget.filters) {
        selectedValues[filter.key] = filter.options.first;
      }
    }
  }



  // show bottom sheet for select option
  void _showOptionSheet({
    required String title,
    required List<FilterOption> options,
    required String currentValue,
    required ValueChanged<FilterOption> onSelected,
  })
  {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.white,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(999),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          title,
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
                    itemCount: options.length,
                    separatorBuilder: (_, __) =>
                        const Divider(height: 1, color: Color(0x99ECECEC)),
                    itemBuilder: (context, index) {
                      final item = options[index];
                      final isSelected = item.value == currentValue;

                      return ListTile(
                        title: Text(
                          item.label,
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
                        onTap: () {
                          onSelected(item);
                          Navigator.pop(context);
                        },
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
  }

  // apply filter and return result to previous screen
  void _applyFilter() {
    Navigator.pop(context, FilterResult(selectedValues));
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      expand: false,
      snap: false,
      initialChildSize: 0.8,
      minChildSize: 0.8,
      maxChildSize: 0.8,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            children: [
              const SizedBox(height: 10),
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: const Color(0xFFD9D9D9),
                  borderRadius: BorderRadius.circular(999),
                ),
              ),
              const SizedBox(height: 16),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: [
                    const Expanded(
                      child: Text(
                        'Bộ lọc',
                        style: TextStyle(
                          fontSize: 20,
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
              const Divider(height: 1),
              Expanded(
                child: SingleChildScrollView(
                  controller: scrollController,
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 20),
                  child: ListView.builder(
                    itemCount: widget.filters.length,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemBuilder: (context, index) {
                      final filter = widget.filters[index];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: _FilterSelectBox(
                          label: filter.title,
                          value:
                              selectedValues[filter.key]?.label ??
                              filter.options[0].label,
                          onTap: () {
                            _showOptionSheet(
                              title: filter.title,
                              options: filter.options,
                              currentValue: selectedValues[filter.key].value,
                              onSelected: (selected) {
                                setState(() {
                                  selectedValues[filter.key] = selected;
                                });
                              },
                            );
                          },
                        ),
                      );
                    },

                  ),
                ),
              ),
              SafeArea(
                top: false,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                  child: SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: _applyFilter,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF005BAC),
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      child: const Text(
                        'Áp dụng',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _FilterSelectBox extends StatelessWidget {
  final String label;
  final String value;
  final VoidCallback onTap;

  const _FilterSelectBox({
    required this.label,
    required this.value,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Ink(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            border: Border.all(color: const Color(0xFFE3E3E3)),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      label,
                      style: const TextStyle(
                        fontSize: 13,
                        color: Color(0xFF9A9A9A),
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      value,
                      style: const TextStyle(
                        fontSize: 15,
                        color: Colors.black,
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.keyboard_arrow_down, color: Color(0xFF005BAC)),
            ],
          ),
        ),
      ),
    );
  }
}


