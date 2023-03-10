import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { downloadImage } from "../../utils";
import { useSwipeable } from "react-swipeable";

import ErrorMessage from "../../hooks/useErrorMessage";
import { Loader } from "../../components";

import axios from "axios";

const Image = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [userNameRef, setUserNameRef] = useState("");

  // ERRORS VALIDATION
  const [errors, setErrors] = useState("");

  // set Errors to ErrorMessage component via setErrors
  useEffect(() => {
    if (image?.error) {
      setErrors(image?.error);
    }
  }, [image]);

  useEffect(() => {
    const button = document.querySelector(".header__button");
    button.innerHTML = "Create";
    button.href = "/create-post";

    return () => {
      button.innerHTML = "";
      button.href = "";
    };
  }, []);

  const getUrlByID = `http://localhost:8000/api/post/${id}`;

  const fetchImage = async () => {
    setLoading(true);

    try {
      const response = await axios.get(getUrlByID, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        setImage(response?.data?.data);

        // set current userRef to the name who created the post
        if (response?.data?.data?.userRef?.name) {
          setUserNameRef(response?.data?.data?.userRef?.name);
        } else {
          setUserNameRef(response?.data?.data?.name);
        }
      } else {
        navigate("/404");
      }
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  const prev = async () => {
    setLoading(true);

    try {
      const response = await axios.get("http://localhost:8000/api/post", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        // check the size of database
        const size = response.data.data.length;
        // get index of current post
        const index = response.data.data.findIndex(
          (post) => post._id === image._id
        );
        // get the previous post
        const prevPost = response.data.data[index - 1];

        if (index > 0) {
          setImage(prevPost);
          navigate(`/image/${prevPost._id}`);

          // set current userRef to the name who created the post
          if (prevPost?.userRef?.name) {
            setUserNameRef(prevPost?.userRef?.name);
          } else {
            setUserNameRef(prevPost?.name);
          }
        } else {
          // if the index of the current post is 0, then loop back around to the front & set the state to the first post
          setImage(response.data.data[size - 1]);
          navigate(`/image/${response.data.data[size - 1]._id}`);
        }
      } else {
        navigate("/404");
      }
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  const next = async () => {
    setLoading(true);

    try {
      const response = await axios.get("http://localhost:8000/api/post", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        // check the size of database
        const size = response.data.data.length;
        // get index of current post
        const index = response.data.data.findIndex(
          (post) => post._id === image._id
        );
        // get the next post
        const nextPost = response.data.data[index + 1];

        if (index < size - 1) {
          setImage(nextPost);
          navigate(`/image/${nextPost._id}`);

          // set current userRef to the name who created the post
          if (nextPost?.userRef?.name) {
            setUserNameRef(nextPost?.userRef?.name);
          } else {
            setUserNameRef(nextPost?.name);
          }
        } else {
          // if the index of the current post is the last post, then loop back around to the front & set the state to the first post
          setImage(response.data.data[0]);
          navigate(`/image/${response.data.data[0]._id}`);
        }
      } else {
        navigate("/404");
      }
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImage();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // function to handle the swipe event using the react-swipeable library
  const handlers = useSwipeable({
    onSwipedLeft: () => prev(),
    onSwipedRight: () => next(),
  });

  // function that allows user to use arrow keys to navigate through posts
  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      next();
    } else if (e.key === "ArrowRight") {
      prev();
    }
  };

  // function that sends user to the profile of the user who created the post
  // but first output "you a dum"
  const handleProfileClick = () => {
    if (!image?.userRef?._id) {
      navigate("/404-not-found");
    } else navigate(`/users/${image?.userRef?._id}`);
  };

  return (
    <section className="w-full">
      <div className="flex flex-col h-full items-center justify-center w-full">
        <div className="exit__button absolute top-0 left-0 m-4 hover:transform hover:translate-y-[-2px] transition duration-200">
          <Link to="/">
            <button className="bg-[#222328] text-white rounded-full p-[6px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
          </Link>
        </div>

        {loading && (
          <div className="pb-6 flex justify-center items-center">
            <Loader />
          </div>
        )}

        {errors && (
          <ErrorMessage
            variant={errors ? "danger" : "success"}
            message={errors}
          />
        )}

        <div className="flex h-full w-full">
          <div
            className="h-full w-11/12 rounded-xl group p-4 flex flex-col items-center justify-center relative shadow-card hover:shadow-lg hover:translate-y-[-0.5px] transition duration-200 card cursor-pointer
            border border-[#222328] border-opacity-10 gap-3 m-auto"
          >
            <p className="text-[#1d161ddd] text-sm italic flex-wrap text-center">
              {image?.prompt}
            </p>
            <div
              className="items-center justify-center w-full flex-1 relative"
              onKeyDown={handleKeyDown}
              {...handlers}
            >
              <div className="h-full w-full absolute">
                <div className="absolute -left-12 sm:-left-20 z-10 flex justify-center items-center h-full">
                  <button
                    className="w-8 h-8 text-gray rounded-full opacity-75 hover:animate-bounce  focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition duration-200 ease-in-out"
                    onClick={next}
                  >
                    <svg
                      className="w-6 h-6 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 19l-7-7 7-7"
                      ></path>
                    </svg>
                  </button>
                </div>
                <div className="absolute -right-[3.25rem] sm:-right-20 z-10 flex justify-center items-center h-full">
                  <button
                    className="w-8 h-8 text-white-900 rounded-full opacity-75 hover:animate-bounce  focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition duration-200 ease-in-out"
                    onClick={prev}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="absolute flex h-full items-center justify-center w-full">
                <div className="flex h-full justify-center">
                  <img
                    className="object-contain rounded-xl"
                    src={image?.photo}
                    alt={image?.name}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-row justify-between text-center items-center w-full h-auto">
              <span
                className="text-[#000000e2] text-md font-bold cursor-pointer hover:translate-y-[-2px] transition duration-200 ease-in-out"
                onClick={handleProfileClick}
              >
                {userNameRef}
              </span>

              <button
                type="button"
                onClick={() => downloadImage(image?._id, image?.photo)}
                className="outline-none bg-transparent border-none"
              >
                <svg
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fas"
                  data-icon="download"
                  className="w-6 mx-auto hover:animate-bounce text-gray-700"
                  role="img"
                  xmlns="https://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                >
                  <path
                    fill="currentColor"
                    d="M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Image;
