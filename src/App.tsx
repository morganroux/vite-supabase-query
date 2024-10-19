// import "./index.css";
import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import supabase from "./utils/supabase";

import TestQuery from "./components/TestQuery";
import { useQueryClient } from "@tanstack/react-query";
import TestPouch from "./components/TestPouch";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const queryClient = useQueryClient();
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />;
  } else {
    return (
      <Container>
        <Typography>Logged in!</Typography>
        <Button
          onClick={() => {
            // clearing cache when logging out
            queryClient.clear();
            supabase.auth.signOut();
          }}
        >
          Sign out
        </Button>
        <TestQuery />
        <Divider />
        <TestPouch />
      </Container>
    );
  }
}
