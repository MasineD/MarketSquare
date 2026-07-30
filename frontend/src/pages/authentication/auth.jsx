// ============= Reusable authentication component =============
import React, { useState, useEffect } from 'react'

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div>
        {isLogin ? (
          <div>
            <h2>Login</h2>
            {/* ---------A card container for the Login form------------ */}
            <div className="loginCard">
            <form>
                <div>
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" placeholder="username" />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" placeholder="password" />
                </div>
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? <button onClick={() => setIsLogin(false)}>Sign up</button></p>
          </div>
          </div>
        ) : (
          <div>
            <h2>Signup</h2>
            {/* Signup form */}
          </div>
        )}
    </div>
  )
}

export default Auth;
