import { Amplify } from 'aws-amplify';

const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || 'us-east-1_3H6uQorus',
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '70hokh0f5poqr4oo7ok6bfd1n1',
      signUpVerificationMethod: 'code' as const,
      loginWith: {
        email: true,
        username: false,
        phone: false,
      },
    },
  },
};

export function configureAmplify() {
  Amplify.configure(amplifyConfig);
}

export default amplifyConfig;