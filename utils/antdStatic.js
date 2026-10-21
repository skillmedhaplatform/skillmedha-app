"use client";
import { useEffect } from "react";
import { App } from "antd";

let messageInstance = null;
let modalInstance = null;
let notificationInstance = null;

export function AntdStaticBridge() {
  const { message, modal, notification } = App.useApp();

  useEffect(() => {
    messageInstance = message;
    modalInstance = modal;
    notificationInstance = notification;
  }, [message, modal, notification]);

  return null;
}

export const appMessage = {
  success: (...args) => (messageInstance ? messageInstance.success(...args) : null),
  error: (...args) => (messageInstance ? messageInstance.error(...args) : null),
  info: (...args) => (messageInstance ? messageInstance.info(...args) : null),
  warning: (...args) => (messageInstance ? messageInstance.warning(...args) : null),
  loading: (...args) => (messageInstance ? messageInstance.loading(...args) : () => {}),
};

export const appModal = {
  confirm: (...args) => (modalInstance ? modalInstance.confirm(...args) : null),
  info: (...args) => (modalInstance ? modalInstance.info(...args) : null),
  success: (...args) => (modalInstance ? modalInstance.success(...args) : null),
  error: (...args) => (modalInstance ? modalInstance.error(...args) : null),
  warning: (...args) => (modalInstance ? modalInstance.warning(...args) : null),
};

export const appNotification = {
  success: (...args) => (notificationInstance ? notificationInstance.success(...args) : null),
  error: (...args) => (notificationInstance ? notificationInstance.error(...args) : null),
  info: (...args) => (notificationInstance ? notificationInstance.info(...args) : null),
  warning: (...args) => (notificationInstance ? notificationInstance.warning(...args) : null),
};
