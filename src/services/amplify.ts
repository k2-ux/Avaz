import { Amplify } from 'aws-amplify';
import config from '../amplifyconfiguration.json';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: config.aws_user_pools_id,
      userPoolClientId: config.aws_user_pools_web_client_id,
      identityPoolId: config.aws_cognito_identity_pool_id,
      loginWith: {
        email: true,
      },
    },
  },
  Storage: {
    S3: {
      bucket: config.aws_user_files_s3_bucket,
      region: config.aws_user_files_s3_bucket_region,
    },
  },
});
