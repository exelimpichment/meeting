export interface ActiveUserData {
  /**
   * the "subject" of the token.
   * the value of this property is the user ID that granted this token.
   */
  sub: string;

  /**
   * the "email" of the user.
   */
  email: string;
}
