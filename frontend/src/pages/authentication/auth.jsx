// ============= Reusable authentication component =============
import React, { useState, useEffect } from 'react'
import '../../index.css'

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)      // State to toggle between login and signup forms
  const [isBuyer, setIsBuyer] = useState(true)    // State to toggle between buyer and seller forms

  return (
    <div>
        {isLogin ? (
          <div className="authContainer">
            <h2>Sign In</h2>
            {/* ---------A card container for the Login form------------ */}
            <div className="loginCard">
            <form>
                <div>
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" placeholder="username" required />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" placeholder="password" required />
                </div>
                <button type="submit">Sign In</button>
            </form>
            <p>Don't have an account? <button onClick={() => setIsLogin(false)}>Sign up</button></p>
          </div>
          </div>
        ) : (
          <div className="authContainer">
            <h2>Sign Up</h2>
            {/* -------radio buttons for selecting buyer or seller */}
            <div>
              <label>
                <input type="radio" name="userType" checked={isBuyer} onChange={() => setIsBuyer(true)} />
                Buyer
              </label>
              <label>
                <input type="radio" name="userType" checked={!isBuyer} onChange={() => setIsBuyer(false)} />
                Seller
              </label>
            </div>
            {/* ---------A card container for the Signup form------------ */}
            {isBuyer ? (
              <div className="signupCard">
                <form>
                  <div>
                    <label htmlFor="fullname">Fullname</label>
                    <input type="text" id="fullname" placeholder="fullname" required />
                </div>
                <div>
                  <label htmlFor="signup-email">Email</label>
                  <input type="email" id="signup-email" placeholder="email" />
                </div>
                <div>
                  <label htmlFor="phone">Phone</label>
                  <input type="text" id="phone" placeholder="phone" required />
                </div>
                <div>
                  <label htmlFor="signup-password">Password</label>
                  <input type="password" id="signup-password" placeholder="password" required/>
                </div>
                <div>
                  <label htmlFor="confirm-password">ConfirmPassword</label>
                  <input type="password" id="confirm-password" placeholder="confirmpassword" required/>
                </div>
                <button type="submit">Sign Up</button>
              </form>
              <p>Already have an account? <button onClick={() => setIsLogin(true)}>Sign In</button></p>
            </div>) : (
              <div className="signupCard">
                <form>
                    <div>
                      <label htmlFor="fullname">Fullname</label>
                      <input type="text" id="fullname" placeholder="fullname" required />
                    </div>
                    <div>
                      <label htmlFor="company-name">Company Name</label>
                      <input type="text" id="company-name" placeholder="company name" required />
                    </div>
                    <div>
                      <label htmlFor="primary-service">Primary Service</label>
                      <input type="text" id="primary-service" placeholder="primary service/ product" required />
                    </div>
                    <div>
                      <label htmlFor="registration-number">Registration Number</label>
                      <input type="text" id="registration-number" placeholder="registration number" />
                    </div>
                    <div>
                      <label htmlFor="signup-email">Email</label>
                      <input type="email" id="signup-email" placeholder="email" required />
                    </div>
                    <div>
                      <label htmlFor="phone">Phone</label>
                      <input type="text" id="phone" placeholder="phone" required />
                    </div>
                    <div>
                      <label htmlFor="signup-password">Password</label>
                      <input type="password" id="signup-password" placeholder="password" required/>
                    </div>
                    <div>
                      <label htmlFor="confirm-password">ConfirmPassword</label>
                      <input type="password" id="confirm-password" placeholder="confirmpassword" required/>
                    </div>
                    <button type="submit">Sign Up</button>
                  </form>
                  <p>Already have an account? <button onClick={() => setIsLogin(true)}>Sign In</button></p>
                </div>)}
              </div>)
            }
    </div>
  )
}

export default Auth;
