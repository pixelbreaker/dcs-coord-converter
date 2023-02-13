import React, { useEffect, useState, useRef } from "react";
import TextField from "@mui/material/TextField";
import styled from "@emotion/styled";
import { useTheme } from "@mui/material";

const mgrsPattern =
  /^(\d{1,2})([^ABIOYZ\d\s]{1})\s*([A-Z]{2})\s*([0-9]{1,5})\s*([0-9]{1,5})$/i;

const Grid = styled.div`
  display: grid;
  grid-gap: ${(props) => props.spacing};
  grid-template-columns: 80px 100px 1fr 1fr;
`;

//30U VB 95070 27278

const InputMGRS = ({ value, onChange }) => {
  const theme = useTheme();

  const gridRef = useRef(null);
  const k100Ref = useRef(null);
  const eastingRef = useRef(null);
  const northingRef = useRef(null);

  const [grid, setGrid] = useState("");
  const [k100, setK100] = useState("");
  const [easting, setEasting] = useState("");
  const [northing, setNorthing] = useState("");

  const [errors, setErrors] = useState({
    grid: false,
    k100: false,
    easting: false,
    northing: false,
  });

  useEffect(() => {
    console.log(value);
    try {
      if (
        value?.length &&
        value !== `${grid} ${k100} ${easting} ${northing}`.toUpperCase()
      ) {
        const [g, k, e, n] = value.split(" ");
        setGrid(g ?? "");
        setK100(k ?? "");
        setEasting(e ?? "");
        setNorthing(n ?? "");
      }
    } catch (e) {
      console.log(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(
    () => {
      const combined = `${grid} ${k100} ${easting} ${northing}`.toUpperCase();
      if (mgrsPattern.test(combined) && combined !== value) {
        onChange(combined);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [grid, k100, easting, northing]
  );

  const handleChangeGrid = ({ target: { value } }) => {
    const valid = /^\d{1,2}[^ABIOYZ\d\s]{1}$/i.test(value);
    setErrors({ ...errors, grid: !valid });
    setGrid(value);
    if (valid) {
      k100Ref.current.focus();
      k100Ref.current.select();
    }
  };

  const handleChangeK100 = ({ target: { value } }) => {
    const valid = /^[A-Z]{2}/i.test(value);
    setErrors({ ...errors, k100: !valid });
    setK100(value);
    if (valid) {
      eastingRef.current.focus();
      eastingRef.current.select();
    }
  };

  const handleChangeEasting = ({ target: { value } }) => {
    setEasting(value);
    const valid = /^\d{1,5}/i.test(value);
    const lengthMatch = value.length === northing.length;
    setErrors({
      ...errors,
      easting: !valid || !lengthMatch,
      northing: !lengthMatch,
    });
    if (valid && value.length >= 5) {
      northingRef.current.focus();
      northingRef.current.select();
    }
  };

  const handleChangeNorthing = ({ target: { value } }) => {
    setNorthing(value);
    const valid = /^\d{1,5}/i.test(value);
    const lengthMatch = value.length === easting.length;
    setErrors({
      ...errors,
      easting: !lengthMatch,
      northing: !valid || !lengthMatch,
    });
  };

  return (
    <Grid spacing={theme.spacing(2)}>
      <TextField
        id="input-grid"
        label="Grid"
        fullWidth
        variant="filled"
        value={grid}
        error={errors.grid}
        inputProps={{ maxLength: 3, pattern: "^d{1,2}[^ABIOYZds]{1}$" }}
        inputRef={gridRef}
        size="small"
        onChange={handleChangeGrid}
      />
      <TextField
        id="input-k100"
        label="100km"
        fullWidth
        variant="filled"
        value={k100}
        error={errors.k100}
        inputProps={{ maxLength: 2 }}
        inputRef={k100Ref}
        size="small"
        onChange={handleChangeK100}
      />
      <TextField
        id="input-easting"
        label="Easting"
        fullWidth
        variant="filled"
        value={easting}
        error={errors.easting}
        inputProps={{ maxLength: 6 }}
        inputRef={eastingRef}
        size="small"
        onChange={handleChangeEasting}
      />
      <TextField
        id="input-northing"
        label="Northing"
        fullWidth
        variant="filled"
        value={northing}
        error={errors.northing}
        inputProps={{ maxLength: 6 }}
        inputRef={northingRef}
        size="small"
        onChange={handleChangeNorthing}
      />
    </Grid>
  );
};

export default InputMGRS;
