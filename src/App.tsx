import React from "react";
import { Root, Routes, addPrefetchExcludes } from "react-static";
import { Router } from "@reach/router";
import Dynamic from "containers/Dynamic";
import { ThemeProvider } from "theme-ui";
import HeaderNav from "components/HeaderNav";
import { Box } from "rebass";
import theme from "./theme";

// Any routes that start with 'dynamic' will be treated as non-static routes
addPrefetchExcludes(["dynamic"]);

function App() {
    return (
        <Root>
            <ThemeProvider theme={theme}>
                <HeaderNav />
                <Box sx={{
                    maxWidth: "80vw",
                    mx: "auto",
                    px: 3,
                }}
                >
                    <React.Suspense fallback={<em>Loading...</em>}>
                        <Router>
                            <Dynamic path="dynamic" />
                            <Routes path="*" />
                        </Router>
                    </React.Suspense>
                </Box>
            </ThemeProvider>
        </Root>
    );
}

export default App;
