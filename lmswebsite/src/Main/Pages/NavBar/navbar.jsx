import React, { useState, useEffect, useRef } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Link,
  Drawer,
  IconButton,
} from "@mui/material";
import { Form, Input, Alert } from "antd";
import Lottie from "lottie-react";
import { Grid, Paper } from "@mui/material";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu"; // MUI menu icon for the hamburger
import animationData from "../../../../src/assets/Login.json";

import { getBoards } from "../../../api/boardApi";
import { getClassesByBoardId } from "../../../api/classApi";
import { getPackageByClassId } from "../../../api/packagesApi";
import { getStudentByAuthId } from "../../../api/studentApi";
import { getTeacherByAuthId } from "../../../api/teacherApi";
import { getUserByAuthId } from "../../../api/userApi";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../config/firebaseConfig";
import { useNavigate } from "react-router-dom";

import Logo from "../../../assets/Logofinal.png";
import { newlogin } from "../../../api/mailNotificationApi";

function HeaderSection() {
  const navigate = useNavigate();

  // States
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [boards, setBoards] = useState({});
  const [classes, setClasses] = useState({});
  const [packages, setPackages] = useState({});
  const [hoveredBoardId, setHoveredBoardId] = useState(null);
  const [hoveredClassId, setHoveredClassId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNestedOpen, setIsNestedOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // for the hamburger menu
 const [form] = Form.useForm();
  // ** Ref for the dropdown menu container **
  const dropdownRef = useRef(null);


  // Logo click -> homepage
  const handleLogoClick = () => {
    navigate("/");
  };

  const handleDropdownToggle = () => {
    setIsCoursesOpen((prev) => !prev);
    form.resetFields();
  };

  const handleCategoryMouseEnter = async (category) => {
    setSelectedCategory(category);
    setIsNestedOpen(true);

    if (!boards[category]) {
      try {
        const fetchedBoards = await getBoards(category);
        setBoards((prev) => ({ ...prev, [category]: fetchedBoards }));
      } catch (error) {
        // console.error(`Error fetching boards: ${error}`);
      }
    }
  };

  // Close the dropdown if user clicks outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCoursesOpen(false);
        setIsNestedOpen(false);
        setSelectedCategory(null);
        setHoveredBoardId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleBoardMouseEnter = async (boardId) => {
    setHoveredBoardId(boardId);
    if (!classes[boardId]) {
      try {
        const fetchedClasses = await getClassesByBoardId(boardId);
        setClasses((prev) => ({ ...prev, [boardId]: fetchedClasses }));
      } catch (error) {
        // console.error(`Error fetching classes: ${error}`);
      }
    }
  };

  // ** NEW: Navigate to board page on click **
  const handleBoardClick = (boardId) => {
    // For example, navigate to "/boards/<boardId>"
    navigate(`/selectBoard`);
    // Optionally close the dropdown
    setIsCoursesOpen(false);
    setIsNestedOpen(false);
  };

  // Drawer toggles
  const toggleDrawer = (open) => () => {
    setIsDrawerOpen(open);
    form.resetFields();
  };

  // // Login
  // const handleLogin = async (values) => {
  //   const { email, password } = values;
  //   setIsSubmitting(true);

  //   try {
  //     const { user } = await signInWithEmailAndPassword(auth, email, password);
  //     localStorage.setItem(
  //       "sessionData",
  //       JSON.stringify({ accessToken: user.accessToken })
  //     );

  //     const profileData = await getUserByAuthId(user.uid);
  //     const sessionData = {
  //       userId: user.uid,
  //       accessToken: user.accessToken,
  //       refreshToken: profileData.user.refresh_token,
  //       name: profileData.user.name,
  //       loggedIn: "true",
  //       role: profileData.user.role,
  //     };
  //     await newlogin(profileData.user._id);
  //     // console.log("user", user);
  //     localStorage.setItem("sessionData", JSON.stringify(sessionData));
  //     //  console.log("userProfileData", profileData);
  //     // Navigate by role
  //     if (profileData.user.role === "admin") {
  //       navigate("/admin");
  //     } else if (profileData.user.role === "student") {
  //       const studentData = await getStudentByAuthId(user.uid);
  //       console.log("studentData", studentData);
  //       if (
  //         (studentData.student.mode == "personal" &&
  //           studentData.student.paymentLink_status === "no_payment_link") &&
  //         studentData.student.is_paid === false
  //         //  &&
  //         // (!studentData.student.amount)
  //       ) {
  //         navigate("/student");
  //       } else if (studentData.student.amount && studentData.student.is_paid === false&&studentData.student.paymentLink_status=="pending") {
  //         navigate("/paymentStatus");
  //       } else if (studentData.student.amount && studentData.student.is_paid === false) {
  //         navigate("/paymentScreen");
  //       } else {
  //         navigate("/student/dashboard");
  //       }
  //     } else if (profileData.user.role === "teacher") {
  //       const teacherData = await getTeacherByAuthId(profileData.user.auth_id);
  //       if (teacherData.teacher) {
  //         navigate("/teacher/dashboard");
  //       } else {
  //         navigate("/teacher");
  //       }
  //     }
  //   } catch (error) {
  //     console.log("Error logging in:", error);
  //     if (error.code === "auth/invalid-credential") {
  //       setErrorMessage("Incorrect Password or Email");
  //     } else if (error.code=="auth/invalid-email") {
  //       setErrorMessage("Invalid Email");
  //     } else {
  //       setErrorMessage("Unable to connect to the internet.");
  //     }
  //   }

  //   setIsSubmitting(false);
  // };


  const handleLogin = async (values) => {
    const { email, password } = values;
    setIsSubmitting(true);
  
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
  
      localStorage.setItem(
        "sessionData",
        JSON.stringify({ accessToken: user.accessToken })
      );
  
      const profileData = await getUserByAuthId(user.uid);
      const sessionData = {
        userId: user.uid,
        accessToken: user.accessToken,
        refreshToken: profileData.user.refresh_token,
        name: profileData.user.name,
        loggedIn: "true",
        role: profileData.user.role,
      };
      await newlogin(profileData.user._id);
      localStorage.setItem("sessionData", JSON.stringify(sessionData));
  
      // Navigate by role
      if (profileData.user.role === "admin") {
        navigate("/admin");
      } else if (profileData.user.role === "student") {
        const studentData = await getStudentByAuthId(user.uid);
        if (
          (studentData.student.mode === "personal" &&
            studentData.student.paymentLink_status === "no_payment_link") &&
          studentData.student.is_paid === false
        ) {
          navigate("/student");
        } else if (
          studentData.student.amount &&
          studentData.student.is_paid === false &&
          studentData.student.paymentLink_status === "pending"
        ) {
          navigate("/paymentStatus");
        } else if (studentData.student.amount && studentData.student.is_paid === false) {
          navigate("/paymentScreen");
        } else {
          navigate("/student/dashboard");
        }
      } else if (profileData.user.role === "teacher") {
        const teacherData = await getTeacherByAuthId(profileData.user.auth_id);
        if (teacherData.teacher) {
          navigate("/teacher/dashboard");
        } else {
          navigate("/teacher");
        }
      }
    } catch (error) {
      // console.log("Error code:", error.code); // Log the actual error code for debugging
      switch (error.code) {
        case "auth/user-not-found":
          setErrorMessage("Invalid email. Please check your credentials.");
          break;
        case "auth/invalid-password":
          setErrorMessage("Incorrect password. Please try again.");
          break;
        case "auth/invalid-email":
          setErrorMessage("Invalid email format. Please check and try again.");
          break;
          case "auth/invalid-credential":
          setErrorMessage("Incorrect Password or Email");
          break;
          case "ERR_BAD_REQUEST":
          setErrorMessage("check your credentials, it seems you have an old credentials.");
          break;
        default:
          setErrorMessage("Unable to connect to the internet or a network error occurred.");
          break;
        }
      // console.error("Error logging in:", error); // Optional for debugging
        
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#fdf2f8",
        color: "#333",
        boxShadow: "none",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "80px",
          px: { xs: 2, md: 4 },
        }}
      >
        {/* Left Section: Logo */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            component="img"
            src={Logo}
            alt="Logo"
            onClick={handleLogoClick}
            sx={{
              width: { xs: "70px", md: "170px" },
              height: { xs: "70px", md: "170px" },
              cursor: "pointer",
            }}
          />
        </Box>

        {/* Center Navigation (hidden on mobile, shown on md+) */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            gap: 3,
          }}
        >
          {/* Courses Dropdown Trigger */}
          <Box sx={{ position: "relative" }} ref={dropdownRef}>
            <Box
              onMouseEnter={handleDropdownToggle}
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                p: "0.5rem 1rem",
                borderRadius: "8px",
                backgroundColor: "#fff",
                "&:hover": { backgroundColor: "#f9f9f9" },
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                Courses
              </Typography>
              {isCoursesOpen ? (
                <IoIosArrowUp style={{ marginLeft: "0.5rem" }} />
              ) : (
                <IoIosArrowDown style={{ marginLeft: "0.5rem" }} />
              )}
            </Box>

            {/* Courses Dropdown Menu */}
            {isCoursesOpen && (
              <Paper
                elevation={3}
                sx={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  mt: 1,
                  width: "300px",
                  borderRadius: "12px",
                  p: "1rem",
                  zIndex: 10,
                  backgroundColor: "#fff",
                  boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.2)",
                }}
              >
                <Grid container spacing={2}>
                  {/* School Level */}
                  <Grid
                    item
                    xs={12}
                    onMouseEnter={() => handleCategoryMouseEnter("School")}
                    onMouseLeave={() => setIsNestedOpen(false)}
                    sx={{
                      position: "relative",
                      "&:hover": {
                        backgroundColor: "#f9f9f9",
                        borderRadius: "8px",
                      },
                    }}
                  >
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold", color: "#6A11CB" }}
                      >
                        School Level
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#555" }}>
                        Study for School Level
                      </Typography>
                    </Box>

                    {isNestedOpen && boards["School"] && (
                      <Paper
                        elevation={3}
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: "100%",
                          width: "250px",
                          borderRadius: "8px",
                          p: "1rem",
                          zIndex: 20,
                          backgroundColor: "#fff",
                          boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.2)",
                        }}
                      >
                        {boards["School"].map((board) => (
                          <Box
                            key={board._id}
                            // Replace handleBoardMouseEnter with handleBoardClick
                            onClick={() => handleBoardClick(board._id)}
                            sx={{
                              cursor: "pointer",
                              "&:hover": {
                                backgroundColor: "#f0f0f0",
                                borderRadius: "8px",
                              },
                              p: "0.5rem",
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: "bold", color: "#333" }}
                            >
                              {board.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#555" }}>
                              {board.description}
                            </Typography>
                          </Box>
                        ))}
                      </Paper>
                    )}
                  </Grid>

                  {/* Another Dropdown Item (Competitive) */}
                  <Grid item xs={12}>
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold", color: "#6A11CB" }}
                      >
                        Competitive Level
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#555" }}>
                        For the Competitive Exams
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </Box>

          {/* Other Navigation Links */}
          <Button
            onClick={() => navigate("/Our-Academy")}
            underline="none"
            sx={{
              color: "#333",
              fontWeight: "medium",
              "&:hover": { color: "#6A11CB" },
              cursor: "pointer",
            }}
          >
            Our Academy
          </Button>
          <Button
            onClick={() => navigate("/blogs")}
            underline="none"
            sx={{
              color: "#333",
              fontWeight: "medium",
              "&:hover": { color: "#6A11CB" },
              cursor: "pointer",
            }}
          >
            Blogs
          </Button>
          <Button
            href="#"
            underline="none"
            sx={{
              color: "#333",
              fontWeight: "medium",
              "&:hover": { color: "#6A11CB" },
              cursor: "pointer",
            }}
          >
            Testimonials
          </Button>
          <Button
            onClick={() => navigate("/ContactUs")}
            underline="none"
            sx={{
              color: "#333",
              fontWeight: "medium",
              "&:hover": { color: "#6A11CB" },
              cursor: "pointer",
            }}
          >
            Contact Us
          </Button>
        </Box>

        {/* Right Section: Action Buttons + Hamburger (Mobile) */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Hide the button or adjust on small screens */}
          <Button
            variant="outlined"
            onClick={toggleDrawer(true)}
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              borderColor: "#ccc",
              color: "#333",
              "&:hover": {
                borderColor: "#6A11CB",
                background: "#6A11CB",
                color: "#fff",
              },
              display: { xs: "none", md: "block" }, // Hide on mobile
            }}
          >
            Log in
          </Button>

          {/* Hamburger Icon - shown only on mobile */}
          <IconButton
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            sx={{
              display: { xs: "flex", md: "none" },
              color: "#333",
            }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      </Toolbar>

      {/* Mobile Menu Drawer (for the hamburger) */}
      <Drawer
        anchor="right"
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: "70%", // adjust as needed
            p: 2,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mt: 2,
          }}
        >
          {/* You can replicate your nav links here */}
          <Link
            href="#"
            underline="none"
            sx={{
              color: "#333",
              fontWeight: "medium",
              "&:hover": { color: "#6A11CB" },
            }}
          >
            Courses
          </Link>
          <Link
            href="#"
            underline="none"
            sx={{
              color: "#333",
              fontWeight: "medium",
              "&:hover": { color: "#6A11CB" },
            }}
          >
            Features
          </Link>
          <Link
            underline="none"
            sx={{
              color: "#333",
              fontWeight: "medium",
              "&:hover": { color: "#6A11CB" },
            }}
          >
            Blogs
          </Link>
          <Link
            href="#"
            underline="none"
            sx={{
              color: "#333",
              fontWeight: "medium",
              "&:hover": { color: "#6A11CB" },
            }}
          >
            Testimonials
          </Link>
          <Link
            href="/ContactUs"
            underline="none"
            sx={{
              color: "#333",
              fontWeight: "medium",
              "&:hover": { color: "#6A11CB" },
            }}
          >
            Contact Us
          </Link>

          {/* Mobile Log in button (optional) */}
          <Button
            variant="outlined"
            onClick={toggleDrawer(true)}
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              borderColor: "#ccc",
              color: "#333",
              "&:hover": {
                borderColor: "#6A11CB",
                background: "#6A11CB",
                color: "#fff",
              },
            }}
          >
            Log In
          </Button>
        </Box>
      </Drawer>

      {/* Login Drawer (for the "Log in" button) */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={toggleDrawer(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "100%", sm: 400 },
          },
        }}
      >
        <Box
          sx={{
            maxWidth: 400,
            width: "100%",
            mx: "auto",
            p: { xs: 2, sm: 3 },
            backgroundColor: "#fff",
            borderRadius: 2,
            boxShadow: "0 1px 6px rgba(0,0,0,0.1)",
          }}
        >
          {/* Title + sub-link */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              mb: 2,
              pt: 3,
              pb: 3,
              color: "#6A11CB",
              fontFamily: "Nunito",
              textAlign: "center",
            }}
          >
            Login as a Student/Teacher
          </Typography>

          <Form onFinish={handleLogin}>
            <Form.Item
              name="email"
              rules={[{ required: true, message: "Please input your email!" }]}
            >
              <Input placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password placeholder="Password" />
            </Form.Item>

            {errorMessage && <Alert message={errorMessage} type="error" />}

            <Box sx={{ mt: 2 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                style={{
                  background: "#6A11CB",
                  borderColor: "#6A11CB",
                  textTransform: "none",
                  color: "#fff",
                  width: "100%",
                }}
              >
                {isSubmitting ? "Logging in..." : "Log In"}
              </Button>
            </Box>
          </Form>

          <Box
            sx={{
              width: "100%",
              mt: 4,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Lottie animationData={animationData} />
          </Box>
        </Box>
      </Drawer>
    </AppBar>
  );
}

export default HeaderSection;
