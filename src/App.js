import styled from "@emotion/styled";
import Mgrs, { LatLon } from "geodesy/mgrs";

import "./App.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useLocalStorage } from "react-use";
import { useContext, useRef, useEffect, useState } from "react";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import AddIcon from "@mui/icons-material/Add";
import CssBaseline from "@mui/material/CssBaseline";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import FitScreenIcon from "@mui/icons-material/FitScreen";
import InputMGRS from "./InputMGRS";
import mapboxgl from "mapbox-gl";
import TerrainIcon from "@mui/icons-material/Terrain";
import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";
import { AppContext } from "./AppContext";

import {
  Button,
  ButtonGroup,
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SpeedDial,
  SpeedDialAction,
  Stack,
  Tabs,
  Tab,
  TextField,
} from "@mui/material";
import Conversions from "./Conversions";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_KEY;

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});

const inputTypes = {
  latlon: "Lat Lon",
  latlondec: "Lat Lon decimal",
  MGRS: "MGRS",
  UTM: "UTM",
};

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  position: fixed;
  width: 100%;
`;

const FormArea = styled(Grid)`
  padding: ${theme.spacing(2)};
`;

const Map = styled.div`
  width: 100%;
  height: 100%;
`;

function a11yProps(index) {
  return {
    id: `tab-${index}`,
    "aria-controls": `tabpanel-${index}`,
  };
}

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [latLon, setLatLon] = useState([51.482, -0.0076]);
  const [zoom, setZoom] = useState(12);
  // const [userPoints, setUserPoints] = useLocalStorage("userPoints", []);
  const markers = useRef([]);
  const [satellite, setSatellite] = useLocalStorage("satellite", false);

  const {
    currentPoint,
    inputName,
    inputType,
    inputValue,
    userPoints,
    setCurrentPoint,
    setCurrentPointState,
    setInputType,
    setInputValue,
    setUserPoints,
  } = useContext(AppContext);

  const setMapType = (satelliteMode) => {
    setSatellite(satelliteMode);
    map.current.setStyle(
      satelliteMode
        ? "mapbox://styles/pixelbreaker/cldzrfmvw00id01qq9udadfhy"
        : "mapbox://styles/pixelbreaker/cldwyre2d000c01mcpdr43m63"
    );
  };
  const handleChangeValue = (value) => {
    setInputValue(value);
  };

  const saveUserPoint = (index) => {
    switch (inputType) {
      case "MGRS":
        try {
          const mgrs = Mgrs.parse(inputValue);
          const lnglat = mgrs
            .toUtm()
            .toLatLon()
            .toString("n")
            .split(",")
            .reverse();

          map.current.panTo(lnglat, { animate: true, duration: 1000 });
          setLatLon([...lnglat].reverse());

          // update the points list
          const newPoints = [...userPoints];
          newPoints[index] = {
            lnglat,
            source: {
              type: "MGRS",
              value: inputValue,
            },
            name: inputName.length
              ? inputName
              : `Point ${userPoints.length + 1}`,
          };
          setUserPoints(newPoints);
          setCurrentPointState(index);
        } catch (e) {
          console.log(e);
        }
        break;

      default:
        break;
    }
  };

  const handleChangeType = (e) => {
    setInputType(e.target.value);
  };

  const fitToPoints = () => {
    if (userPoints.length) {
      const bounds = new mapboxgl.LngLatBounds(
        userPoints[0].lnglat,
        userPoints[0].lnglat
      );

      userPoints.forEach((point) => {
        bounds.extend(point.lnglat);
      });

      map.current.fitBounds(bounds, { padding: 80, maxZoom: 10 });
    }
  };

  const createNewPoint = () => {
    const { lng, lat } = map.current.getCenter();

    switch (inputType) {
      case "MGRS":
        const p = new LatLon(lat, lng);
        const [g, k] = p.toUtm().toMgrs().toString().split(" ");
        console.log(`${g} ${k}`);
        setInputValue(`${g} ${k}`);
        break;

      default:
        break;
    }

    setCurrentPoint(userPoints.length);
  };

  const deleteAllPoints = () => {
    setUserPoints([]);
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];
    setCurrentPoint(0);
  };

  const handleTabChange = (e, newIndex) => {
    if (newIndex === userPoints.length) {
      createNewPoint();
    }
    const mapBounds = map.current.getBounds();
    const currLngLat = userPoints[newIndex].lnglat;

    if (!mapBounds.contains(currLngLat)) {
      map.current.panTo(currLngLat, { animate: true, duration: 1000 });
    }
    setCurrentPoint(newIndex);
  };

  // Init
  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      center: latLon.reverse(),
      container: mapContainer.current,
      doubleClickZoom: false,
      hash: true,
      optimizeForTerrain: true,
      style: satellite
        ? "mapbox://styles/pixelbreaker/cldzrfmvw00id01qq9udadfhy"
        : "mapbox://styles/pixelbreaker/cldwyre2d000c01mcpdr43m63",
      zoom,
    });

    fitToPoints();

    const nav = new mapboxgl.NavigationControl({
      showCompass: true,
      visualizePitch: true,
    });
    map.current.addControl(nav, "bottom-right");

    const scale = new mapboxgl.ScaleControl({
      maxWidth: 200,
      unit: "imperial",
    });
    map.current.addControl(scale, "bottom-left");
  });

  useEffect(() => {
    userPoints.forEach(({ lnglat }, index) => {
      let currentMarker = markers.current[index];
      if (currentMarker) {
        currentMarker.setLngLat(lnglat);
        currentMarker
          .getElement()
          .querySelector("svg path[fill]")
          .setAttribute("fill", index === currentPoint ? "#F00" : "#999");
      } else {
        currentMarker = new mapboxgl.Marker({
          color: index === currentPoint ? "#F00" : "#999",
        })
          .setLngLat(lnglat)
          .addTo(map.current);
        markers.current[index] = currentMarker;
      }
      const currentMarkerEl = currentMarker.getElement();
      currentMarkerEl.addEventListener("click", () => {
        setCurrentPoint(index);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPoints, currentPoint]);

  const actions = [
    {
      icon: <FitScreenIcon />,
      name: "Show all points",
      onClick: () => fitToPoints(),
    },
    {
      icon: <DeleteSweepIcon />,
      name: "Delete all",
      onClick: () => deleteAllPoints(),
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppContainer>
        <SpeedDial
          ariaLabel="Add and edit points"
          direction="down"
          sx={{ position: "fixed", top: 30, right: 30 }}
          icon={<AddIcon />}
          FabProps={{
            onClick: () => createNewPoint(),
          }}
        >
          {actions.map(({ name, icon, onClick }) => (
            <SpeedDialAction
              key={name}
              icon={icon}
              tooltipTitle={name}
              onClick={onClick}
            />
          ))}
        </SpeedDial>
        <ButtonGroup
          variant="contained"
          orientation="vertical"
          sx={{
            backgroundColor: "primary.dark",
            position: "fixed",
            top: 20,
            left: 20,
            zIndex: 20,
          }}
          aria-label="map-type"
        >
          <Button onClick={() => setMapType(false)} color="primary">
            <TerrainIcon sx={{ opacity: !satellite ? 1 : 0.4 }} />
          </Button>
          <Button onClick={() => setMapType(true)} color="primary">
            <SatelliteAltIcon sx={{ opacity: satellite ? 1 : 0.4 }} />
          </Button>
        </ButtonGroup>
        <Map ref={mapContainer} />
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Tabs
            value={currentPoint}
            onChange={handleTabChange}
            aria-label="basic tabs example"
            variant="scrollable"
            scrollButtons="auto"
          >
            {userPoints.map((point, index) => (
              <Tab
                label={index + 1}
                {...a11yProps(index)}
                sx={{ minWidth: 60 }}
              />
            ))}
            <Tab label="New" {...a11yProps(2)} />
          </Tabs>
        </Box>
        <Box
          sx={{
            width: "100%",
            bgcolor: "background.paper",
            p: 1,
          }}
        >
          <FormArea container spacing={2}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth variant="filled">
                <InputLabel id="input-type-label">Input type</InputLabel>
                <Select
                  fullWidth
                  labelId="input-type-label"
                  id="input-type"
                  value={inputType}
                  label="System"
                  size="small"
                  onChange={handleChangeType}
                >
                  {Object.keys(inputTypes).map((value, index) => {
                    return (
                      <MenuItem value={value} key={index}>
                        {inputTypes[value]}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={9}>
              {inputType === "MGRS" && (
                <InputMGRS value={inputValue} onChange={handleChangeValue} />
              )}
              {inputType !== "MGRS" && (
                <TextField
                  id="input-coord"
                  label="Input coordinate"
                  variant="filled"
                  fullWidth
                  value={inputValue}
                  onChange={handleChangeValue}
                />
              )}
            </Grid>
            <Grid item xs={12} md={12}>
              <Stack spacing={2} direction="row-reverse">
                <Button
                  onClick={() => saveUserPoint(currentPoint)}
                  variant="contained"
                  endIcon={<AddCircleIcon />}
                >
                  {currentPoint === userPoints.length ? "New Point" : "Save"}
                </Button>
              </Stack>
            </Grid>
          </FormArea>
        </Box>
        <Conversions />
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;
