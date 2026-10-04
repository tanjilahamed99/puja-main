import Image from "next/image";
import React from "react";

const Logo = ({ className }) => {
  return (
    <Image
      src="/logo.png"
      alt="Karmkand Bharti"
      width={500}
      height={500}
      className={className ? className : "w-10 h-10"}
    />
  );
};

export default Logo;
