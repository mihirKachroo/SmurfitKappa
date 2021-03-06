import React, { useRef, useState, useEffect } from 'react';
import {
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonLabel,
  IonInput,
  IonAlert,
  IonToolbar,
  IonTitle,
  IonHeader,
  IonPage,
  IonIcon,
} from '@ionic/react';
import './Profile.css';

import InputControl from '../components/input-control.component';
import Submission from '../components/submission.component';
import Menu from '../components/menu.component';

const Profile = () => {
  // window.location.reload(false)
  console.log('Looking at profile');

  const usernameInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const [error, setError] = useState();
  const [status, setStatus] = useState('Login');

  const setStatusHandler = (selectedType) => {
    debugger;
    setStatus(selectedType);
  };

  const submitHandler = () => {
    const enteredUsername = usernameInputRef.current?.value;
    const enteredPassword = passwordInputRef.current?.value;

    if (!enteredUsername || !enteredPassword) {
      setError('Please submit a valid username or password');

      return;
    }

    //post request, post the submission
  };

  const resetHandler = () => {
    usernameInputRef.current.value = '';
    passwordInputRef.current.value = '';
  };

  const clearError = () => {
    setError('');
  };

  return (
    <React.Fragment>
      <IonAlert
        isOpen={!!error}
        message={error}
        buttons={[
          {
            text: 'Okay',
            handler: () => {
              return clearError;
            },
          },
        ]}
      />

      <IonPage>
        <Menu title="profile" />
        <IonHeader>
          <IonToolbar>
            <IonTitle>Login/Register</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonGrid>
            <IonRow>
              <IonCol>
                <InputControl selectedValue={status} onSelectValue={setStatusHandler} />
              </IonCol>
            </IonRow>

            <IonRow>
              <IonCol>
                <IonItem>
                  <IonLabel position="floating">
                    Username
                    {console.log('Here in Profile Username, status is ', status)}
                  </IonLabel>
                  <IonInput type="text" ref={usernameInputRef}></IonInput>
                </IonItem>
              </IonCol>
            </IonRow>

            <IonRow>
              <IonCol>
                <IonItem>
                  <IonLabel position="floating">Password</IonLabel>
                  <IonInput type="text" ref={passwordInputRef}></IonInput>
                </IonItem>
              </IonCol>
            </IonRow>

            <Submission onSubmit={submitHandler} onReset={resetHandler} />
          </IonGrid>
        </IonContent>
      </IonPage>
    </React.Fragment>
  );
};

export default Profile;
