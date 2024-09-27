import React, {
  createContext,
  ReactNode,
  useMemo,
  useState,
  useContext,
} from "react";

export interface Video {
  title: string;
  url: string;
  thumbnail: string;
  _id: string;
}

export interface User {
  data: {
    academics: [];
    videos: Video[];
    id?: string;
    _id?: string;
    firstName: string;
    lastName: string;
    phone: string;
    profilePicture: string;
    createdAt?: string;
    email?: string;
    password?: string;
    updatedAt?: string;
    userName?: string;
    verificationToken?: string;
    verified?: boolean;
  };
  message?: string;
  status?: string;
}

export interface GlobalContextData {
  userDetails: User | null;
  setUserDetails: React.Dispatch<React.SetStateAction<User | null>>;
  token: string | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
}

export const GlobalContext = createContext<GlobalContextData>({
  userDetails: null,
  setUserDetails: () => {
    throw new Error("Function not implemented.");
  },
  token: null,
  setToken: () => {
    throw new Error("Function not implemented.");
  },
});

export const useToken = () => {
  const { token } = useContext(GlobalContext);
  return { token };
};

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [userDetails, setUserDetails] = useState<User | null>(() => {
    const storedUserDetails = localStorage.getItem("userDetails");
    return storedUserDetails ? JSON.parse(storedUserDetails) : null;
  });

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );

  const valueObj: GlobalContextData = useMemo(
    () => ({
      userDetails,
      setUserDetails,
      token,
      setToken,
    }),
    [userDetails, token]
  );

  return (
    <GlobalContext.Provider value={valueObj}>{children}</GlobalContext.Provider>
  );
};
