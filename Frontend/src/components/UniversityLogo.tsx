import React, { useState } from "react";
import { Text, type StyleProp, type TextStyle } from "react-native";
import { Image } from "expo-image";

type UniversityLogoProps = {
  name: string;
  shortName: string;
  logoUrl?: string | null;
  textStyle: StyleProp<TextStyle>;
};

export const UniversityLogo: React.FC<UniversityLogoProps> = ({
  name,
  shortName,
  logoUrl,
  textStyle,
}) => {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (!logoUrl || failedUrl === logoUrl) {
    return <Text style={textStyle}>{shortName}</Text>;
  }

  return (
    <Image
      source={{ uri: logoUrl }}
      style={{ width: "100%", height: "100%", borderRadius: 12, backgroundColor: "#FFFFFF" }}
      contentFit="contain"
      accessibilityLabel={`${name} logo`}
      onError={() => setFailedUrl(logoUrl)}
    />
  );
};
