// =========The contacts section,containing contact details of the developer=============
import React, { useState } from 'react'
import emailjs from '@emailjs/browser'
import { MdSend } from 'react-icons/md'
import { FaCheckCircle } from 'react-icons/fa'

export default function ContactUs(){
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    })
    // A constant array of contact details
const developerDetails = [
    {
        label:'Email',
        value:'masinedonald@gmail.com',
        link: 'mailto:masinedonald@gmail.com'
    },
    {
        label:'LinkedIn',
        value:'Donald Masine',
        link: 'https://www.linkedin.com/in/donald-masine-17a430270/'
    },
    {
        label:'Whatsapp',
        value:'Main_Dee',
        link: 'https://wa.me/27647266704'
    }
]
    const [isLoading, setIsLoading] = useState(false)
    const [submitStatus, setSubmitStatus] = useState({
    type: null,
    message: "",
  })
// Function to send the message
  const handleSubmit = async (e) =>{
    e.preventDefault();
    setIsLoading(true);
    setSubmitStatus({type: null, message: ""});
    try{
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      // Checking if we're using the correct environment variables
      if(!serviceId || !templateId || !publicKey){
        throw new Error(
          "EmailJS configuration variables are missing"
        );
      }
      await emailjs.send(serviceId, templateId, {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      }, publicKey)
      // If successfull
      setSubmitStatus({
        type: "success",
        message: "Message sent successfully."
      })
      // Reset the form data
      setFormData({
        name: "",
        email:"",
        subject:"",
        message:""
      })
    }
    catch(error){
      alert("Error occured trying to send email")
      console.log("Error occured trying to send email", error.message)
      setSubmitStatus({
        type: "error",
        message: error.message || "Error occured trying to send email"
      })
    }
    finally{
      setIsLoading(false);
    }
  }
    return(
        <section id='contactSection' className='py-24 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-black via-green-900/50 to-black'>
            <div className="grid grid-cols-1 mx-auto max-w-7xl">
                <div className="sectionIntro text-center mb-16">      {/*Introductory details to the section*/}
                    <h2 className="sectionHeading text-4xl sm:text-5xl md:text-6xl font-heading font-bold mb-4 bg-gradient-to-r from-white to-green-400 bg-clip-text text-transparent">
                        Contact Us
                    </h2>
                    <div className="w-24 h-1 bg-green-500 mx-auto rounded-full mb-8"></div>
                    <p className="miniDescription text-base sm:text-lg text-green-300 max-w-2xl mx-auto">
                        Have questions? We would love to hear from you. Send us a message and we will respond as soon as possible.
                    </p>
                </div>
                
                {/* Mapping the elements from the developerDetails array into individual cards */}
                <div className="contactSection_Details flex flex-col lg:flex-row gap-8 lg:gap-12 items-stretch justify-center">
                    {/* Send Message Form */}
                   <form onSubmit={handleSubmit} className="flex-1 bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-green-500/30 shadow-xl">
              <h2 className='text-2xl font-bold text-white text-center mb-6'>Send us a message</h2>
              <div className="mb-5">
                <label htmlFor="name" className='block text-green-300 text-sm font-medium mb-2'>Name</label>
                <input id='name' name="user_name" type="text" required placeholder='Your name' value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})}
                className='w-full px-4 py-3 bg-gray-800/50 rounded-xl border border-green-500/30 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all text-white placeholder-gray-400'/>
              </div>
              <div className="mb-5">
                <label htmlFor="email" className='block text-green-300 text-sm font-medium mb-2'>Email</label>
                <input id='email' type="email" name="user_email" required placeholder='youremailaddress@example.com' value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})}
                className='w-full px-4 py-3 bg-gray-800/50 rounded-xl border border-green-500/30 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all text-white placeholder-gray-400'/>
              </div>
              <div className="mb-5">
                <label htmlFor="subject" className='block text-green-300 text-sm font-medium mb-2'>Subject</label>
                <input id='subject' name="subject" type="text" placeholder='Subject line' value={formData.subject} onChange={(e)=>setFormData({...formData, subject: e.target.value})}
                className='w-full px-4 py-3 bg-gray-800/50 rounded-xl border border-green-500/30 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all text-white placeholder-gray-400'/>
              </div>
              <div className="mb-6">
                <label htmlFor="message" className='block text-green-300 text-sm font-medium mb-2'>Message</label>
                <textarea rows={5} id="message" name='message' required placeholder='Write your message here...' value={formData.message} onChange={(e)=>setFormData({...formData, message: e.target.value})}
                className='w-full px-4 py-3 bg-gray-800/50 rounded-xl border border-green-500/30 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all resize-none text-white placeholder-gray-400'/>
              </div>
              <button type='submit' disabled={isLoading} className='bg-green-600 hover:bg-green-700 rounded-full w-full py-3 text-white text-lg font-medium flex items-center justify-center gap-2 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] disabled:opacity-50 disabled:cursor-not-allowed'>
               {isLoading ? (
                  <>Sending...</>
               ):(
                  <>Send Message <MdSend size={20} /> </>
               )}
              </button>

              {submitStatus.type && (
                <div className={`mt-4 flex items-center gap-3 p-4 rounded-xl ${submitStatus.type === "success" ? 
                  "bg-green-500/10 border border-green-500/20 text-green-400" :
                  "bg-red-500/10 border border-red-500/20 text-red-400"
                }`}>
                  {submitStatus.type === "success" && (
                    <FaCheckCircle className='w-5 h-5 flex-shrink-0' />
                  )}
                  <p className="text-sm">{submitStatus.message}</p>
                </div>
              )}
            </form>
                    
                    {/* Contact Cards */}
                    {/* Contact Cards */}
                    <div className="cardContainer flex-1 space-y-4">
                        <h3 className="text-xl font-semibold text-white mb-4 text-center">Connect with us</h3>
                        {developerDetails.map((detail,index) => (
                            <div key={index} className="contactDetailsCard bg-white/10 backdrop-blur-sm rounded-lg p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-green-500/30 hover:border-green-500 group">
                                <a href={detail.link} target='_blank' rel="noopener noreferrer" className="block">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="contactPlatform text-green-400 font-semibold text-lg group-hover:text-green-300 transition-colors">
                                                {detail.label}
                                            </h4>
                                            <p className="contactName text-gray-300 text-sm mt-1">
                                                {detail.value}
                                            </p>
                                        </div>
                                        <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center group-hover:bg-green-500/40 transition-colors">
                                            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}