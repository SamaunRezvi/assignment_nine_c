'use client';

import { useLocale, useTranslations } from 'next-intl';

// The API, BetterAuth and a few client helpers report errors as English
// sentences. Map the known ones to catalog keys so they show in the active
// language; anything unknown is shown as it came.
const ERROR_KEY: Record<string, string> = {
  'A review is required': 'reviewRequired',
  'A valid final amount is required to complete a job': 'finalAmountRequired',
  'A valid proposed date and shift are required': 'proposedRequired',
  'All fields are required': 'allFieldsRequired',
  'Base price must be a positive number': 'pricePositive',
  'Booking not found': 'bookingNotFound',
  'Date must be in YYYY-MM-DD format': 'dateFormat',
  'Forbidden access': 'forbidden',
  'Invalid category': 'invalidCategory',
  'Invalid role': 'invalidRole',
  'Invalid service mode': 'invalidServiceMode',
  'Invalid status': 'invalidStatus',
  'Not signed in': 'notSignedIn',
  'Only a requested booking can be cancelled': 'onlyRequestedCancel',
  'Only a requested booking can be rescheduled': 'onlyRequestedReschedule',
  'Payment not completed': 'paymentNotCompleted',
  'Payment record not found': 'paymentNotFound',
  'Preferred date must be today or a future date': 'preferredDateFuture',
  'Problem description must be at least 20 characters': 'descriptionMin',
  'Proposed date must be today or a future date': 'proposedDateFuture',
  'Rating must be a whole number between 1 and 5': 'ratingRange',
  'Service not found': 'serviceNotFound',
  'Shift must be morning, noon, evening or night': 'invalidShift',
  'Something went wrong on the server': 'serverError',
  'Something went wrong': 'generic',
  'Technician not found': 'technicianNotFound',
  'The technician is not available on this date': 'technicianUnavailable',
  'This booking has no pending reschedule proposal': 'noPendingReschedule',
  'This booking has no valid amount to pay': 'noAmount',
  'This booking has not been paid yet': 'notPaid',
  'This booking is not ready for payment': 'notReadyForPayment',
  'This shift is fully booked. Please choose another shift or date.': 'shiftFull',
  'Too many requests, please try again later': 'tooManyRequests',
  'Unauthorized access': 'unauthorized',
  'User not found': 'userNotFound',
  'You already have an active request for this service': 'activeRequest',
  'You can only rate a completed and paid job': 'rateOnlyPaid',
  'You cannot change your own role': 'ownRole',
  'You cannot request your own service': 'ownService',
  'You have already rated this job': 'alreadyRated',
  'Invalid email or password': 'invalidCredentials',
  'User already exists': 'userExists',
  'User already exists. Use another email.': 'userExists',
  'Password too short': 'passwordTooShort',
  'Could not load your account. Please try again.': 'loadAccount',
  'Could not start your session. Please try again.': 'startSession',
  'Could not load your profile. Please try again.': 'loadProfile',
  'Your account profile is invalid. Please contact support.': 'invalidProfile',
  'Your session changed. Please sign in again.': 'sessionChanged',
  'The server is taking too long. Please try again.': 'serverSlow',
  'Could not connect to the server. Please try again.': 'noConnection',
  'Choose a JPG, PNG, WebP, or GIF image.': 'imageType',
  'This image is empty. Choose another file.': 'imageEmpty',
  'Choose an image smaller than 10 MB.': 'imageTooLarge',
  'Image uploads are currently unavailable. Please contact support.': 'uploadsUnavailable',
  'Could not upload the image. Check your connection and try again.': 'uploadConnection',
  'Image upload failed. Please try again.': 'uploadFailed',
  'Could not load updates. Please try again.': 'loadUpdates',
  'Could not download the invoice': 'invoiceDownload',
};

// BetterAuth also sends a stable code, which is safer than its wording.
const AUTH_CODE_KEY: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: 'invalidCredentials',
  USER_ALREADY_EXISTS: 'userExists',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'userExists',
  PASSWORD_TOO_SHORT: 'passwordTooShort',
};

export function useErrorText() {
  const t = useTranslations('errors');
  const locale = useLocale();
  return (error: unknown, fallback: string, code?: string) => {
    if (code && AUTH_CODE_KEY[code]) return t(AUTH_CODE_KEY[code]);
    const message = typeof error === 'string' ? error : error instanceof Error ? error.message : '';
    if (!message) return fallback;
    const key = ERROR_KEY[message];
    if (key) return t(key);
    // An unrecognised English sentence would break a Bangla screen, so use
    // the caller's translated message there instead.
    return locale === 'en' ? message : fallback;
  };
}
