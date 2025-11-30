export interface LoginRequest {
    userName: string;
    password: string;
}
export interface RegisterRequest {
    userName: string;
    emailAddress: string;
    firstName: string;
    lastName: string;
    password: string;
}
export declare const authApi: {
    login(payload: LoginRequest): Promise<any>;
    register(payload: RegisterRequest): Promise<any>;
    verifyEmail(token: string): Promise<any>;
    logout(personId: number): Promise<void>;
    refresh(personId: number): Promise<any>;
    forgotPassword(email: string): Promise<any>;
    resetPassword(token: string, newPassword: string): Promise<any>;
};
//# sourceMappingURL=authApi.d.ts.map