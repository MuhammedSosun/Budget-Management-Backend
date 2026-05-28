import { ErrorCode } from "./ErrorCodes";

export const ErrorMessages: Record<ErrorCode, string> = {
    [ErrorCode.USER_NOT_FOUND]: "User not found.",
    [ErrorCode.INVALID_CREDENTIALS]: "Incorrect email or password.",
    [ErrorCode.EMAIL_NOT_VERIFIED]: "Please verify your email address first.",
    [ErrorCode.RATE_LIMIT_EXCEEDED]: "You are performing actions too fast, please slow down.",
    [ErrorCode.INTERNAL_SERVER_ERROR]: "An internal server error occurred.",
    [ErrorCode.NOT_FOUND]: "Resource not found.",
    [ErrorCode.WORKSPACE_NOT_FOUND]: "Workspace not found.",
    [ErrorCode.WORKSPACE_ALREADY_EXISTS]: "Workspace already exists.",
    [ErrorCode.WORKSPACE_ACCESS_DENIED]: "Access denied to the workspace.",
    [ErrorCode.WORKSPACE_CREATE_FAILED]: "Failed to create workspace.",
    [ErrorCode.DEFAULT_WORKSPACE_CREATE_FAILED]: "Failed to create default workspace.",
    [ErrorCode.WORKSPACE_OWNER_MEMBER_CREATE_FAILED]: "Failed to create workspace owner member.",
    [ErrorCode.WORKSPACE_MEMBER_NOT_FOUND]: "Workspace member not found.",
    [ErrorCode.WORKSPACE_MEMBER_NOT_IN_WORKSPACE]: "The workspace member does not belong to the specified workspace.",
    [ErrorCode.WORKSPACE_MEMBER_ROLE_UPDATE_FAILED]: "Failed to update member role.",
    [ErrorCode.WORKSPACE_MEMBER_USER_NOT_FOUND]: "Member user not found.",
    [ErrorCode.OWNER_ROLE_CANNOT_BE_CHANGED]: "The role of the OWNER user cannot be changed.",
    [ErrorCode.OWNER_CANNOT_BE_REMOVED]: "The OWNER cannot be removed from the workspace.",
    [ErrorCode.CANNOT_REMOVE_YOURSELF_FROM_WORKSPACE]: "You cannot remove yourself from the workspace.",
    [ErrorCode.WORKSPACE_INVITATION_USER_NOT_FOUND]: "Invited user not found.",
    [ErrorCode.CANNOT_INVITE_YOURSELF]: "You cannot invite yourself.",
    [ErrorCode.USER_ALREADY_WORKSPACE_MEMBER]: "User is already a member of this workspace.",
    [ErrorCode.WORKSPACE_INVITATION_ALREADY_PENDING]: "An invitation is already pending for this user.",
    [ErrorCode.WORKSPACE_INVITATION_NOT_FOUND]: "Invitation not found.",
    [ErrorCode.WORKSPACE_INVITATION_NOT_VALID]: "This invitation is no longer valid.",
    [ErrorCode.WORKSPACE_INVITATION_EXPIRED]: "The invitation has expired.",
    [ErrorCode.WORKSPACE_INVITATION_NOT_OWNED_BY_USER]: "This invitation does not belong to this user.",
    [ErrorCode.WORKSPACE_INVITATION_REJECT_FAILED]: "Failed to reject the invitation.",
    [ErrorCode.WORKSPACE_INVITATION_WORKSPACE_NOT_FOUND]: "The workspace for this invitation could not be found.",
    [ErrorCode.UNAUTHORIZED]: "Unauthorized action.",
    [ErrorCode.INVALID_OR_EXPIRED_TOKEN]: "Invalid or expired token.",
    [ErrorCode.TOKEN_NOT_FOUND]: "Token not found.",
    [ErrorCode.FORBIDDEN]: "Access forbidden.",

    [ErrorCode.USER_ALREADY_EXISTS]: "This email address is already registered.",

    [ErrorCode.GOOGLE_ACCOUNT_PASSWORD_NOT_AVAILABLE]:
        "This account was created using Google. To change your password, you must first set a local password.",
    [ErrorCode.PASSWORD_MISMATCH]: "Passwords do not match.",
    [ErrorCode.PASSWORD_UPDATE_FAILED]: "Failed to update password.",

    [ErrorCode.PROFILE_UPDATE_FAILED]: "Failed to update profile information.",
    [ErrorCode.AVATAR_UPDATE_FAILED]: "Failed to update profile picture.",

    [ErrorCode.TRANSACTION_NOT_FOUND]: "Transaction not found.",
    [ErrorCode.TRANSACTION_CREATE_FAILED]: "Failed to create transaction.",
    [ErrorCode.TRANSACTION_UPDATE_FAILED]: "Failed to update transaction.",
    [ErrorCode.TRANSACTION_DELETE_FAILED]: "Failed to delete transaction.",
    [ErrorCode.INVALID_TRANSACTION_CURRENCY]: "Invalid transaction currency.",
    [ErrorCode.INVALID_TRANSACTION_DATE_RANGE]: "Invalid transaction date range.",
    [ErrorCode.REFRESH_TOKEN_NOT_FOUND]: "Refresh token not found.",
    [ErrorCode.REFRESH_TOKEN_INVALID]: "Refresh token is invalid.",
    [ErrorCode.REFRESH_TOKEN_EXPIRED]: "Refresh token has expired.",

    [ErrorCode.ACCESS_TOKEN_EXPIRED]: "Access token has expired.",
    [ErrorCode.ACCESS_TOKEN_INVALID]: "Access token is invalid.",

    [ErrorCode.EMAIL_ALREADY_VERIFIED]: "Email address is already verified.",
    [ErrorCode.EMAIL_VERIFICATION_CODE_INVALID]: "Verification code is invalid.",
    [ErrorCode.EMAIL_VERIFICATION_CODE_EXPIRED]: "Verification code has expired.",
    [ErrorCode.EMAIL_VERIFICATION_TOO_MANY_ATTEMPTS]:
        "Too many verification attempts.",

    [ErrorCode.GOOGLE_LOGIN_FAILED]: "Google login failed.",
    [ErrorCode.GOOGLE_SIGNUP_FAILED]: "Google signup failed.",
    [ErrorCode.GOOGLE_ACCOUNT_IS_NOT_VERIFIED]: "Google account is not verified.",
    [ErrorCode.GOOGLE_EMAIL_ACCOUNT_IS_NOT_VERIFIED]:
        "Google email account is not verified.",

    [ErrorCode.TRANSACTION_ALREADY_EXISTS]: "Transaction already exists.",


    [ErrorCode.VALIDATION_ERROR]: "Validation error.",
    [ErrorCode.INVALID_IMAGE_FORMAT]: "Invalid image format.",
    [ErrorCode.AVATAR_REQUIRED]: "Avatar is required.",
    [ErrorCode.TOO_MANY_ATTEMPTS]: "Too many attempts.",
    [ErrorCode.GOOGLE_USER_ALREADY_EXISTS_EMAIL]: "Google user already exists.",
    [ErrorCode.GOOGLE_USER_NOT_FOUND]: "Google user not found.",
    [ErrorCode.IDEMPOTENCY_KEY_CONFLICT]: "This idempotency key was used with a different request. Please use a new key.",
    [ErrorCode.IDEMPOTENCY_REQUEST_ALREADY_PROCESSED]: "This request has already been processed. Please use a new idempotency key.",
    [ErrorCode.RATE_LIMIT_EMAIL_RESEND]: "Too many verification emails sent. Please wait 10 minutes.",
    [ErrorCode.RATE_LIMIT_TOO_FAST]: "You are sending requests too fast. Please slow down.",
    [ErrorCode.RATE_LIMIT_REFRESH]: "Refresh token rate limit exceeded.",
    [ErrorCode.DEFAULT_WORKSPACE_CANNOT_BE_DELETED]: "Default workspace cannot be deleted.",
    [ErrorCode.WORKSPACE_OWNER_NOT_FOUND]: "Owner of workspace not found.",
    [ErrorCode.INVALID_ID]: "Invalid ID.",
    [ErrorCode.WORKSPACE_UPDATE_FAILED]: "Failed to update workspace.",
    [ErrorCode.DEFAULT_WORKSPACE_CANNOT_BE_LEFT]: "Default workspace cannot be left.",
    [ErrorCode.WORKSPACE_OWNER_CANNOT_LEAVE]: "Owner cannot leave the workspace.",

    [ErrorCode.BUDGET_LIMIT_ALREADY_EXISTS]: "Budget limit for this category and period already exists.",
    [ErrorCode.BUDGET_LIMIT_CREATE_FAILED]: "Failed to create budget limit.",
    [ErrorCode.BUDGET_LIMIT_NOT_FOUND]: "Budget limit not found.",
    [ErrorCode.BUDGET_LIMIT_UPDATE_FAILED]: "Failed to update budget limit.",
    [ErrorCode.INVALID_BUDGET_MONTH]: "Invalid budget month.",


};