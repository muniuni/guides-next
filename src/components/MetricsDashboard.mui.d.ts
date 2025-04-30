import '@mui/material/Grid';

declare module '@mui/material/Grid' {
  interface GridTypeMap {
    props: {
      item?: boolean;
      container?: boolean;
      xs?: number | boolean;
      sm?: number | boolean;
      md?: number | boolean;
      lg?: number | boolean;
      xl?: number | boolean;
    };
  }
}
