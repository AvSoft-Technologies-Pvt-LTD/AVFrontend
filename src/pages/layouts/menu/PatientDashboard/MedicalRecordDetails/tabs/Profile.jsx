import React from "react";
import { Activity } from "lucide-react";
import ProfileCard from "../../../../../../components/microcomponents/ProfileCard";

const Profile = ({ displayPatientName, profileFields, getInitials }) => {
  return (
    <ProfileCard
      initials={getInitials(displayPatientName)}
      name={displayPatientName}
      fields={profileFields}
    />
  );
};

export default Profile;
