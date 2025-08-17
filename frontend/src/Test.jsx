import React from 'react'
import './test-styles.css'

const Test = () => {
  return (
    <div>
      {/* Test with inline CSS */}
      <div style={{backgroundColor: 'red', color: 'white', padding: '20px', margin: '20px', borderRadius: '8px'}}>
        <h1 style={{fontSize: '2rem', fontWeight: 'bold'}}>Inline CSS Test</h1>
        <p style={{fontSize: '1.2rem', marginTop: '1rem'}}>If you can see this red box, inline CSS works!</p>
      </div>
      
      {/* Test with CSS file */}
      <div className="test-red">
        <h1>CSS File Test</h1>
        <p>If you can see this red box, CSS file loading works!</p>
      </div>
      
      {/* Test with Tailwind CSS */}
      <div className="bg-blue-500 text-white p-8 m-4 rounded-lg">
        <h1 className="text-4xl font-bold">Tailwind CSS Test</h1>
        <p className="text-lg mt-4">If you can see this blue box, Tailwind is working!</p>
        <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4">
          Test Button
        </button>
      </div>
    </div>
  )
}

export default Test