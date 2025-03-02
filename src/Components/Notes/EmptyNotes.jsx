import React from "react";
import { Box, Typography } from "@mui/material";
import { LightbulbOutlined } from "@mui/icons-material";

export const EmptyNotes = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "5rem",
        height: "50vh",
      }}
    >
      <LightbulbOutlined
        sx={{
          backgroundSize: "120px 120px",
          height: "120px",
          margin: "20px",
          opacity: ".1",
          width: "120px",
        }}
      />
      <Typography
        sx={{ fontSize: "1.375rem" }}
        align="center"
        variant="h6"
        color="#5f6368"
      >
        Notes you add appear here
      </Typography>
    </Box>
  );
};
