import React, { useEffect, useState } from 'react';
import { Button, Spinner } from 'flowbite-react';
import { useUserContext } from 'contexts/UserContext';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Trans, useTranslation } from 'react-i18next';
import Link from '../components/ui/Link';
import { StringParam, useQueryParams, withDefault } from 'use-query-params';
import TextInputGroup from 'components/forms/TextInputGroup';
import HeadContent from 'components/HeadContent';
import { navigate } from 'gatsby';
import useToastContext, { SEVERITY } from 'hooks/useToast';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
});

const Login = () => {
  const {
    user,
    loading,
    actions: { logIn },
  } = useUserContext();

  const addToast = useToastContext();

  const [redirectTo, setRedirectTo] = useState(null);

  const { t } = useTranslation();

  const [{ redirectTo: redirectToParam }] = useQueryParams({
    redirectTo: withDefault(StringParam, '/'),
  });

  useEffect(() => {
    if (!loading && user) {
      const missingNames = !user.first_name || !user.last_name;

      const isSignup = !!localStorage.getItem('signup');

      const askToCompleteProfile = missingNames && isSignup;

      localStorage.removeItem('signup');

      setRedirectTo(askToCompleteProfile ? '/account?askToCompleteProfile=1' : redirectToParam);
    }
  }, [loading]);

  return (
    <>
      {loading ? (
        <div className="flex flex-wrap gap-2">
          <Spinner />
          <Trans>Loading...</Trans>
        </div>
      ) : user ? (
        <>
          <p>
            <Trans ns="login">Logged in as </Trans>
            {user.email}
          </p>
          <Link to="/logout">
            <Trans ns="login">Log out</Trans>
          </Link>
        </>
      ) : (
        <>
          <Formik
            initialValues={{ email: '' }}
            validationSchema={LoginSchema}
            onSubmit={async ({ email }, { setSubmitting }) => {
              const result = await logIn(email, redirectTo || '');

              if (result.ok) {
                navigate('/verify-request/?email=' + email);
              } else {
                addToast({
                  message: t('An unknown error has occurred'),
                  severity: SEVERITY.danger,
                  error: result.error,
                });
              }

              setSubmitting(false);
            }}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
              isValid,
            }) => (
              <Form onSubmit={handleSubmit}>
                <div className="mb-4 w-full" id="formBasicEmail">
                  <TextInputGroup
                    type="email"
                    label={t('Email address')}
                    placeholder={t('Email')}
                    name="email"
                    value={values.email}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    values={values}
                    errors={errors}
                    touched={touched}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className="w-full"
                  data-cy="login-btn"
                >
                  {isSubmitting && <Spinner />}
                  <span className="pl-3">
                    <Trans ns="login">Login</Trans>
                  </span>
                </Button>
              </Form>
            )}
          </Formik>

          <div className="my-2 flex justify-center">
            <Trans>or</Trans>
          </div>

          <div className="mt-3">
            <Trans ns="login">Don&apos;t have an account?</Trans>{' '}
            <Link to="/signup/">
              <Trans ns="login">Sign up</Trans>
            </Link>
          </div>
        </>
      )}
    </>
  );
};

export const Head = (props) => {
  const { t } = useTranslation();

  return (
    <HeadContent
      metaTitle={t('AIID - Login')}
      path={props.location.pathname}
      metaDescription={t('Login to your account')}
    />
  );
};

export default Login;
