import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
  useMemo,
} from "react";
import Axios from "axios";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { ToastContainer, toast } from "react-toastify";
import ReactToPrint from "react-to-print";
import { FiPrinter } from "react-icons/fi";
import { FaTrashAlt, FaTimesCircle } from "react-icons/fa";
import "moment/locale/hr";
import {
  Button,
  Box,
  Text,
  chakra,
  SimpleGrid,
  Flex,
  Stack,
  Tooltip,
  useColorModeValue,
  InputGroup,
  Input,
  InputRightElement,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";

import { TiDelete } from "react-icons/ti";
function RezervacijaAdmin() {
  const dataColor = useColorModeValue("white", "gray.800");
  const bg = useColorModeValue("white", "gray.800");
  const bg2 = useColorModeValue("gray.100", "gray.700");
  const [rezervacijaList, setRezervacijaList] = useState([]);
  const [danasDatum] = useState(new Date());
  const componentRef = useRef();
  //Varijabla za setiranje true ili false mjenjanje moda za brisnanje rezervacije
  let [modeBrisanje, setModeBrisanje] = useState(false);

  useEffect(() => {
    Axios.get("/auth/rezervacijelista")
      .then((response) => {
        setRezervacijaList(response.data);
      })
      .catch((error) => {
        console.error("An error occurred while fetching reservations:", error);
        toast("⚠️ Failed to fetch reservations.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          status: "error",
        });
      });
  }, []);

  const deleteRezervacija = (id) => {
    Axios.delete(`/auth/rezervacijadelete/${id}`)
      .then((response) => {
        setRezervacijaList((prevList) =>
          prevList.filter((rez) => rez.id !== id)
        );
        toast("❌ Reservation deleted successfully.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      })
      .catch((error) => {
        console.error("An error occurred while deleting reservation:", error);
        toast("⚠️ Failed to delete reservation.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          status: "error",
        });
      });
  };

  const odobriRezervaciju = (id) => {
    Axios.put(`/auth/rezervacijaodobri/${id}`)
      .then((response) => {
        setRezervacijaList((prevList) =>
          prevList.map((rez) =>
            rez.id === id ? { ...rez, odobreno: true } : rez
          )
        );
        toast("✔️ Reservation approved successfully.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      })
      .catch((error) => {
        console.error("An error occurred while approving reservation:", error);
        toast("⚠️ Failed to approve reservation.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          status: "error",
        });
      });
  };
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState(null);

  const onDeleteClick = (id) => {
    setSelectedReservationId(id);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedReservationId(null);
  };

  const confirmDelete = () => {
    deleteRezervacija(selectedReservationId);
    closeModal();
  };
  moment.locale("hr");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const handleDeleteClick = () => {
    setSearchTerm("");
  };
  const localizer = momentLocalizer(moment);
  function RezervacijaCalendar({ reservations }) {
    // Utility function for converting reservation times to events
    const convertToEvent = (reservation) => {
      const startDate = moment(reservation.t_start).toDate();
      const endDate = moment(reservation.t_end).toDate();
      const nights = moment(endDate).diff(startDate, "days");

      return {
        title: `${reservation.user_name} - Room: ${reservation.room_id}`,
        start: startDate,
        end: endDate,
        confirmed: reservation.odobreno,
        reservation, // Object shorthand can be used here
        nights,
      };
    };

    // Memoized events array
    const events = useMemo(
      () => reservations.map(convertToEvent),
      [reservations]
    );

    // Event style getter memoized
    const eventStyleGetter = useCallback(
      (event) => ({
        style: {
          backgroundColor: event.confirmed ? "green" : "#FF0200",
          borderRadius: "0px",
          color: "white",
          border: "0px",
          display: "block",
        },
      }),
      []
    );

    // Custom event renderer memoized
    const customEvent = useCallback(({ event }) => {
      const tooltipContent = (
        <>
          <div>
            <strong>Email:</strong> {event.reservation.user_mail}
          </div>
          <div>
            <strong>Phone:</strong> {event.reservation.user_phone}
          </div>
          <div>
            <strong>Nights:</strong> {event.nights}
          </div>
          {/* Add any additional details you want to display in the tooltip */}
        </>
      );

      return (
        <Tooltip label={tooltipContent} placement="top" hasArrow>
          <div>{event.title}</div>
        </Tooltip>
      );
    }, []);

    return (
      <div style={{ height: "500px", margin: "40px" }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          eventPropGetter={eventStyleGetter}
          firstDayOfWeek={1}
          components={{
            event: customEvent,
          }}
        />
      </div>
    );
  }

  console.log(searchCategory);
  return (
    <div>
      <RezervacijaCalendar reservations={rezervacijaList} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div>
        <Text py={10} fontWeight="semibold" textAlign="center">
          Administrator
        </Text>
        <SimpleGrid></SimpleGrid>
        <Flex
          w="full"
          bg="white"
          _dark={{
            bg: "#3e3e3e",
          }}
          px={{ base: 1, "2xl": 16 }}
          alignItems="center"
          justifyContent="center"
        >
          <Stack
            direction={{
              base: "column",
            }}
            w="full"
            bg={{
              md: bg,
            }}
            shadow="lg"
          >
            <SimpleGrid
              columns={{
                base: 2,
                "2xl": 2,
              }}
              w={{
                base: "full",
                "2xl": "full",
              }}
              textTransform="uppercase"
              fontSize="md"
              fontWeight="hairline"
            >
              <Box mx={5} textAlign="left" w={{ base: "100%", lg: "40%" }}>
                <InputGroup pb={5}>
                  {" "}
                  {/* Za optimizaciju maknut da ovaj setSearchTerm ne rerendera sve komponente(trenutno ne predstavlja nikakav problem) */}
                  <Input
                    className="rezervacije__search"
                    placeholder="Pretraži rezervacije po imenu"
                    value={searchTerm} // searchterm ko value kako nebi nestalo kad se ugasi sidebar
                    onChange={(e) => setSearchTerm(e.target.value)} // onChange filter
                  />
                  {
                    //conditional rendering za button brisanja(ako je pretrazivanje prazno nemoj prikazivati gumb)
                    searchTerm.length !== 0 && (
                      <InputRightElement style={{ marginRight: "5px" }}>
                        <Button
                          h="1.75rem"
                          size="sm"
                          onClick={handleDeleteClick}
                        >
                          <TiDelete color="red" size="20" />
                        </Button>
                      </InputRightElement>
                    )
                  }
                </InputGroup>
                <Select
                  placeholder="Izaberite kategoriju"
                  onChange={(e) => setSearchCategory(e.target.value)}
                >
                  <option value="true">Odobreno</option>
                  <option value="false">Nije odobreno</option>
                </Select>
              </Box>
              <Box px={{ base: 1, "2xl": 20 }} py={10} textAlign="right">
                {modeBrisanje === false ? (
                  <Button
                    className="buttonBrisanje"
                    onClick={() => setModeBrisanje(true)}
                  >
                    <FaTrashAlt size={35} />
                  </Button>
                ) : (
                  <Button
                    className="buttonBrisanje"
                    onClick={() => setModeBrisanje(false)}
                  >
                    <FaTimesCircle size={35} />
                  </Button>
                )}
                <ReactToPrint
                  bodyClass="naslovrezervacija"
                  documentTitle={
                    "Lista_rezervacija_" +
                    moment(danasDatum).format("DD_MM_YYYY")
                  }
                  trigger={() => (
                    <Button>
                      <FiPrinter size={35} />
                    </Button>
                  )}
                  content={() => componentRef.current}
                />
              </Box>
            </SimpleGrid>
          </Stack>
        </Flex>
      </div>
      <Flex
        ref={componentRef}
        w="full"
        bg="white"
        _dark={{
          bg: "#3e3e3e",
        }}
        px={{ base: 1, "2xl": 20 }}
        alignItems="center"
        justifyContent="center"
      >
        <Stack
          direction={{
            base: "column",
          }}
          w="full"
          bg={{
            md: bg,
          }}
          shadow="lg"
        >
          {rezervacijaList.length > 0 &&
            rezervacijaList
              .filter((user) => {
                if (
                  searchTerm !== "" &&
                  !user.user_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
                ) {
                  return false;
                }

                if (
                  searchCategory !== "" &&
                  user.odobreno.toString() !== searchCategory
                ) {
                  return false;
                }
                return true;
              })
              .map((user, pid) => {
                return (
                  <Flex
                    direction={{
                      base: "row",
                      "2xl": "column",
                    }}
                    bg={dataColor}
                    key={pid}
                  >
                    <SimpleGrid
                      columns={{
                        base: 1,
                        "2xl": 8,
                      }}
                      w={{
                        base: "full",
                        "2xl": "full",
                      }}
                      textTransform="uppercase"
                      bg={bg2}
                      color={"gray.500"}
                      py={{
                        base: 1,
                        "2xl": 4,
                      }}
                      px={{
                        base: 2,
                        "2xl": 10,
                      }}
                      fontSize="md"
                      fontWeight="hairline"
                    >
                      <chakra.span>Smještaj</chakra.span>
                      <chakra.span>Ime</chakra.span>
                      <chakra.span>Broj</chakra.span>
                      <chakra.span>Mail</chakra.span>
                      <chakra.span>Datum Početni</chakra.span>
                      <chakra.span>Datum krajni</chakra.span>
                      <chakra.span>Datum kreiranja</chakra.span>
                      <chakra.span className="mogucnostiText">
                        Akcija
                      </chakra.span>
                    </SimpleGrid>
                    <SimpleGrid
                      spacingY={5}
                      columns={{
                        base: 1,
                        "2xl": 8,
                      }}
                      w="full"
                      py={{ "2xl": 2 }}
                      pl={{ base: 2 }}
                      px={{ "2xl": 10 }}
                      pb={{ base: 2 }}
                      fontWeight="hairline"
                    >
                      <chakra.span>{user.room_id}</chakra.span>
                      <chakra.span>{user.user_name}</chakra.span>
                      <chakra.span>{user.user_phone}</chakra.span>
                      <chakra.span>{user.user_mail}</chakra.span>
                      <chakra.span>
                        {moment(user.t_start).format("DD.MM.YYYY.")}
                      </chakra.span>
                      <chakra.span>
                        {moment(user.t_end).format("DD.MM.YYYY.")}
                      </chakra.span>
                      <chakra.span>
                        {moment(user.created_at).format("DD.MM.YYYY.")}
                      </chakra.span>
                      {
                        //prikaz gumba za brisanje i odobrenje rezervacije ovisno o stanju "modeBrisanja" varijable
                        modeBrisanje === false ? (
                          user.odobreno === true ? (
                            <chakra.span className="mogucnostiButton">
                              <Button
                                className="mogucnostiButton"
                                _hover={{ bg: "red" }}
                                bg="red"
                                color="white"
                                onClick={() => onDeleteClick(user.id)}
                              >
                                Obriši rezervaciju
                              </Button>
                            </chakra.span>
                          ) : (
                            <chakra.span className="mogucnostiButton">
                              <Button
                                className="mogucnostiButton"
                                _hover={{ bg: "#65842E" }}
                                bg="#65842E"
                                color="white"
                                onClick={() => odobriRezervaciju(user.id)}
                              >
                                Odobri rezervaciju
                              </Button>
                            </chakra.span>
                          )
                        ) : (
                          <chakra.span className="mogucnostiButton">
                            <Button
                              className="mogucnostiButton"
                              _hover={{ bg: "red" }}
                              bg="red"
                              color="white"
                              onClick={() => onDeleteClick(user.id)}
                            >
                              Obriši rezervaciju
                            </Button>
                          </chakra.span>
                        )
                      }
                    </SimpleGrid>
                  </Flex>
                );
              })}
        </Stack>
      </Flex>
      <Modal isOpen={isDeleteModalOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Potvrdite brisanje</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Jeste li sigurni da želite obrisati ovu rezervaciju?
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={closeModal}>
              Odustani
            </Button>
            <Button colorScheme="red" onClick={confirmDelete}>
              Obriši
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Dio za printanje tablice rezervacije*/}
    </div>
  );
}

export default RezervacijaAdmin;
