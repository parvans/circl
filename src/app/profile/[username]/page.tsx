import React from 'react'

const ProfilePage = async({ params }:{params:{username:string}}) => {
    const props = await params
    console.log(props);
  return (
    <div>
        <h1>Profile Page</h1>
    </div>
  )
}

export default ProfilePage
