import React from "react";
import Avatar, { genConfig } from "react-nice-avatar";

export default function RandomAvatar({ sex }) {
  const manHairStyles = ["thick", "mohawk"];
  const womanHairStyles = ["normal", "womanLong", "womanShort"];

  const randomManHairStyle =
    manHairStyles[Math.floor(Math.random() * manHairStyles.length)];
  const randomWomanHairStyle =
    womanHairStyles[Math.floor(Math.random() * womanHairStyles.length)];
  const config = genConfig({
    sex,
    hairStyle: sex === "man" ? randomManHairStyle : randomWomanHairStyle,
  });
  // const noUniqueUser = {sex,hairStyle: sex === "man" ? randomManHairStyle : randomWomanHairStyle};
  // const choose = uniqueUser? uniqueUser : noUniqueUser;
  // const config = genConfig(choose);

  return < Avatar style={{ width: "2rem", height: "2rem" }} {...config} />;
}
