function (user, context, callback) {
  const validCodes = ['RSMU-ABC123', 'RSMU-XYZ789']; // replace with your real codes

  const inviteCode = user.user_metadata && user.user_metadata.inviteCode;

  if (!inviteCode || !validCodes.includes(inviteCode)) {
    return callback(new UnauthorizedError('Invalid or missing invite code.'));
  }

  return callback(null, user, context);
}
