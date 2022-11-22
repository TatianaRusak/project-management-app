/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { useNavigate } from '@tanstack/react-location';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { useEffect } from 'react';

import { userApi } from '@/api/services/userService';
import { saveLocalOnLogout } from '@/app/auth';
import { Loader } from '@/components/Loader/Loader';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import './Profile.pcss';
import { authSlice } from '@/store/reducers/AuthSlice';

export const Profile = (): JSX.Element => {
  const { t } = useTranslation();

  const { user, isLoggedIn } = useAppSelector(state => state.authReducer);
  const dispatch = useAppDispatch();
  const { logOff } = authSlice.actions;

  const userId = user?.id as string;

  const {
    data: userData,
    isLoading: isUserLoading,
    isError,
  } = userApi.useGetUserQuery(userId, { skip: !isLoggedIn });
  const [updateUser, { error, isLoading: updateIsLoading }] = userApi.useUpdateUserMutation();
  const [removeUser, { isLoading: removeIsLoading }] = userApi.useRemoveUserMutation();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      login: userData?.login as string,
      name: userData?.name as string ,
      password: '' },
  });
  const navigate = useNavigate();

  const logOut = () =>{
    dispatch(logOff());
    saveLocalOnLogout();
    toast.success(t('TOASTER.LOGGED_OUT'));
  };

  async function onSubmit (data: Record<string, string>) {
    const { login, name, password } = data;
    await updateUser({ id: userId, userData: { login, name, password } });
  }

  async function handleRemove () {
    await removeUser(userId);
    logOut();
  }

  useEffect(() => {
    if (!isLoggedIn) {
      navigate({ to: '/' });
    }
  }, [isLoggedIn, navigate]);

  return (
    <section className="profile">

      {((isUserLoading || updateIsLoading || removeIsLoading) && <Loader/> )}
      <div className="profile-item">
        <h1 className='profile-heading'>{t('PROFILE.EDIT')}</h1>
      </div>
      <form className="profile-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="profile-item">
          <input
            placeholder={t('SIGN_UP.LOGIN') as string}
            className='profile-input'
            defaultValue={userData?.login}
            {...register('login', {
              required: true,
              pattern: {
                value: /[A-Za-z0-9]{4,20}/i,
                message: '',
              },
            })}
            aria-invalid={errors.login ? 'true' : 'false'}
            type="mail"
          />

          <div className="error-field">
            {errors.login?.type === 'required' && (
              <span role="alert">{t('SIGN_UP.ENTER_LOGIN')}</span>
            )}
            {errors.login?.type === 'pattern' && (
              <span role="alert">{t('SIGN_UP.LOGIN_WRONG')}</span>
            )}
          </div>
        </div>
        <div className="profile-item">

          <input
            placeholder={t('SIGN_UP.NAME') as string}
            className='profile-input'
            defaultValue={userData?.name}
            {...register('name', {
              required: true,
              pattern: {
                value: /[A-Za-z]{3,30}/i,
                message: '',
              },
              minLength: 3,
            })}
            aria-invalid={errors.name ? 'true' : 'false'}
            type="text"
          />

          <div className="error-field">
            {errors.name?.type === 'required' && (
              <span role="alert">{t('SIGN_UP.ENTER_NAME')}</span>
            )}
            {errors.name?.type === 'minLength' && (
              <span role="alert">{t('SIGN_UP.NAME_MIN')}</span>
            )}
            {errors.name?.type === 'pattern' && (
              <span role="alert">{t('SIGN_UP.NAME_WRONG')}</span>
            )}
          </div>
        </div>

        <div className="profile-item">

          <input
            placeholder={t('SIGN_UP.PASSWORD') as string}
            className='profile-input'
            {...register('password', {
              required: true,
              minLength: 8,
            })}
            aria-invalid={errors.password ? 'true' : 'false'}
            type="password"
          />

          <div className="error-field">
            {errors.password?.type === 'required' && (
              <span role="alert">{t('SIGN_UP.ENTER_PASSWORD')}</span>
            )}
            {errors.password?.type === 'minLength' && (
              <span role="alert">{t('SIGN_UP.PASSWORD_MIN')}</span>
            )}
          </div>
        </div>

        <div className="profile-item">
          <button type="submit" className='profile-button'>
            {t('PROFILE.SAVE')}
          </button>
        </div>

        <div className="profile-item">
          <button type="button" className='profile-button' onClick={handleRemove}>
            {t('PROFILE.DELETE')}
          </button>
        </div>
      </form>
    </section>
  );
};
