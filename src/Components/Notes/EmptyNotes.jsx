import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { LightbulbOutlined, NoteAddOutlined } from "@mui/icons-material";

export const EmptyNotes = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "2rem",
        height: "60vh",
        width: "100%",
        animation: "fadeIn 0.5s ease-in-out",
        "@keyframes fadeIn": {
          "0%": {
            opacity: 0,
            transform: "translateY(10px)"
          },
          "100%": {
            opacity: 1,
            transform: "translateY(0)"
          }
        }
      }}
    >
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "40px",
          borderRadius: "16px",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(10px)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)"
          }
        }}
      >
        <Box sx={{ position: "relative", mb: 3 }}>
          <LightbulbOutlined
            sx={{
              height: "120px",
              width: "120px",
              opacity: ".15",
              color: "#5f6368",
              position: "relative",
              zIndex: 1
            }}
          />
          <NoteAddOutlined 
            sx={{
              position: "absolute",
              bottom: "10px",
              right: "-15px",
              height: "40px",
              width: "40px",
              color: (theme) => theme.palette.primary.main,
              opacity: 0.9,
              animation: "pulse 2s infinite",
              "@keyframes pulse": {
                "0%": {
                  transform: "scale(1)",
                  opacity: 0.9
                },
                "50%": {
                  transform: "scale(1.1)",
                  opacity: 1
                },
                "100%": {
                  transform: "scale(1)",
                  opacity: 0.9
                }
              }
            }}
          />
        </Box>
        <Typography
          sx={{ 
            fontSize: "1.5rem",
            fontWeight: 500,
            mb: 1
          }}
          align="center"
          variant="h6"
          color="#5f6368"
        >
          Notes you add appear here
        </Typography>
        <Typography
          sx={{ 
            fontSize: "1rem",
            maxWidth: "300px",
            textAlign: "center",
            color: "#80868b"
          }}
        >
          Click the form above to create your first note and get started
        </Typography>
      </Paper>
    </Box>
  );
};
