import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hrms/feature/account/presentation/screens/account_screen.dart';
import 'package:hrms/feature/home/presentation/screens/home_screen.dart';
import 'package:hrms/feature/notification/presentation/screens/notification_screen.dart';
import 'package:hrms/feature/task/presentation/screens/task-screen.dart';
import 'package:hrms/core/widget/main_shell_page.dart';

import 'app_routes.dart';

// NavigatorKey riêng cho từng tab → giữ state khi switch tab
final _homeNavigatorKey =
GlobalKey<NavigatorState>(debugLabel: 'home');
final _taskNavigatorKey =
GlobalKey<NavigatorState>(debugLabel: 'task');
final _notificationNavigatorKey =
GlobalKey<NavigatorState>(debugLabel: 'notification');
final _accountNavigatorKey =
GlobalKey<NavigatorState>(debugLabel: 'account');

final shellRoute = StatefulShellRoute.indexedStack(
  builder: (context, state, navigationShell) {
    return MainShellPage(
      currentIndex: navigationShell.currentIndex,
      onTap: (index) {
        navigationShell.goBranch(
          index,
          initialLocation: index == navigationShell.currentIndex,
        );
      },
      child: navigationShell,
    );
  },
  branches: [
    StatefulShellBranch(
      navigatorKey: _homeNavigatorKey,
      routes: [
        GoRoute(
          path: AppRoutes.home,
          builder: (context, state) => const HomeScreen(),
        ),
      ],
    ),
    StatefulShellBranch(
      navigatorKey: _taskNavigatorKey,
      routes: [
        GoRoute(
          path: AppRoutes.task,
          builder: (context, state) => const TaskScreen(),
        ),
      ],
    ),
    StatefulShellBranch(
      navigatorKey: _notificationNavigatorKey,
      routes: [
        GoRoute(
          path: AppRoutes.notification,
          builder: (context, state) => const NotificationScreen(),
        ),
      ],
    ),
    StatefulShellBranch(
      navigatorKey: _accountNavigatorKey,
      routes: [
        GoRoute(
          path: AppRoutes.account,
          builder: (context, state) => const AccountScreen(),
        ),
      ],
    ),
  ],
);