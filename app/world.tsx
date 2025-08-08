// import * as React from "react";
// import Svg, { SvgProps, Path } from "react-native-svg";
// const SvgComponent = (props: SvgProps) => (
//   <Svg
//     // viewBox="-169.110266 83.600842 190.486279 -58.508473"
//     viewBox="-169.110266 -58.508473 190.486279 58.508473" // corrected example
//     width={200}
//     height={200}
//     {...props}
//   >
//     <Path
//       d="m479.683 331.627-.077.025-.258.155-.147.054-.134.027-.105-.01-.058-.092.006-.139-.024-.124-.02-.067.038-.18.086-.098.119-.08.188.03.398.115.083.11v.071l-.072.12z"
//       fill={props.fill || "black"}
//     />
//   </Svg>
// );
// export default SvgComponent;
import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgComponent = (props: SvgProps) => (
  <Svg
    viewBox="-169.110266 83.600842 190.486279 58.508473" // fixed: positive height
    width={300}
    height={200}
    {...props}
  >
    <Path
      d="m479.683 331.627-.077.025-.258.155-.147.054-.134.027-.105-.01-.058-.092.006-.139-.024-.124-.02-.067.038-.18.086-.098.119-.08.188.03.398.115.083.11v.071l-.072.12z"
      fill={props.fill || "blue"} // ensure it's visible
    />
  </Svg>
);

export default SvgComponent;
