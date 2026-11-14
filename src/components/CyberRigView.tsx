// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Polygon, Rect } from 'react-native-svg';
import { RigPose } from '../engine/cyberRig';
import { RigSkin } from '../engine/rigSkins';

interface CyberRigViewProps {
  pose: RigPose;
  skin: RigSkin;
  size?: number;
  caption?: string;
  testID?: string;
}

const GRID_COORDS = [40, 80, 120, 160];

function renderProp(pose: RigPose, skin: RigSkin): React.ReactNode {
  const { prop, propPos } = pose;
  if (prop === 'kettlebell' && propPos) {
    return (
      <>
        <Path
          d={`M ${propPos.x - 5} ${propPos.y - 4} A 5 5 0 0 1 ${propPos.x + 5} ${propPos.y - 4}`}
          stroke={skin.accentColor}
          strokeWidth={2.5}
          fill="none"
        />
        <Circle
          cx={propPos.x}
          cy={propPos.y + 5}
          r={8}
          fill={skin.accentColor}
          fillOpacity={0.28}
          stroke={skin.accentColor}
          strokeWidth={2}
        />
      </>
    );
  }
  if (prop === 'rings') {
    return (
      <>
        <Line
          x1={pose.wristL.x}
          y1={0}
          x2={pose.wristL.x}
          y2={pose.wristL.y}
          stroke="#475569"
          strokeWidth={2}
        />
        <Line
          x1={pose.wristR.x}
          y1={0}
          x2={pose.wristR.x}
          y2={pose.wristR.y}
          stroke="#475569"
          strokeWidth={2}
        />
        <Circle
          cx={pose.wristL.x}
          cy={pose.wristL.y}
          r={6}
          stroke={skin.accentColor}
          strokeWidth={2.5}
          fill="none"
        />
        <Circle
          cx={pose.wristR.x}
          cy={pose.wristR.y}
          r={6}
          stroke={skin.accentColor}
          strokeWidth={2.5}
          fill="none"
        />
      </>
    );
  }
  if (prop === 'rope') {
    return (
      <Path
        d={`M ${pose.wristL.x} ${pose.wristL.y} Q 100 194 ${pose.wristR.x} ${pose.wristR.y}`}
        stroke={skin.accentColor}
        strokeWidth={2}
        strokeDasharray="4,3"
        fill="none"
      />
    );
  }
  if (prop === 'wall') {
    return (
      <Line
        x1={28}
        y1={16}
        x2={28}
        y2={182}
        stroke={skin.accentColor}
        strokeWidth={3}
        strokeOpacity={0.5}
      />
    );
  }
  return null;
}

function renderHeadGlyph(pose: RigPose, skin: RigSkin): React.ReactNode {
  const { x, y } = pose.head;
  const r = 11;
  return (
    <>
      <Circle cx={x} cy={y} r={r + 4} fill={skin.glowColor} />
      <Circle cx={x} cy={y} r={r} fill="#0b1120" stroke={skin.limbColor} strokeWidth={2.5} />
      {skin.headShape === 'visor' && (
        <Rect x={x - 8} y={y - 3} width={16} height={5} rx={2} fill={skin.jointColor} />
      )}
      {skin.headShape === 'horns' && (
        <>
          <Polygon
            points={`${x - 9},${y - 4} ${x - 14},${y - 15} ${x - 4},${y - 9}`}
            fill={skin.accentColor}
          />
          <Polygon
            points={`${x + 9},${y - 4} ${x + 14},${y - 15} ${x + 4},${y - 9}`}
            fill={skin.accentColor}
          />
        </>
      )}
      {skin.headShape === 'helmet' && (
        <Path
          d={`M ${x - 11} ${y - 2} A 11 11 0 0 1 ${x + 11} ${y - 2} Z`}
          fill={skin.accentColor}
          fillOpacity={0.6}
        />
      )}
      {skin.headShape === 'hood' && (
        <Polygon
          points={`${x - 13},${y + 4} ${x},${y - 16} ${x + 13},${y + 4}`}
          fill="none"
          stroke={skin.accentColor}
          strokeWidth={2}
        />
      )}
      {skin.headShape === 'crown' && (
        <Polygon
          points={`${x - 9},${y - 10} ${x - 4},${y - 17} ${x},${y - 11} ${x + 4},${y - 17} ${x + 9},${y - 10}`}
          fill={skin.jointColor}
        />
      )}
      {skin.headShape === 'cyber-bob' && (
        <Line
          x1={x - 7}
          y1={y - 2}
          x2={x + 8}
          y2={y - 2}
          stroke={skin.jointColor}
          strokeWidth={2.5}
        />
      )}
    </>
  );
}

/** Parametric 14-joint 2D cyber-skeleton rig rendered via react-native-svg. */
export function CyberRigView({
  pose,
  skin,
  size = 148,
  caption,
  testID,
}: CyberRigViewProps): React.ReactElement {
  const segments: [typeof pose.head, typeof pose.head][] = [
    [pose.neck, pose.hip],
    [pose.shoulderL, pose.shoulderR],
    [pose.shoulderL, pose.elbowL],
    [pose.elbowL, pose.wristL],
    [pose.shoulderR, pose.elbowR],
    [pose.elbowR, pose.wristR],
    [pose.hip, pose.kneeL],
    [pose.kneeL, pose.ankleL],
    [pose.hip, pose.kneeR],
    [pose.kneeR, pose.ankleR],
  ];

  const joints = [
    pose.neck,
    pose.shoulderL,
    pose.shoulderR,
    pose.elbowL,
    pose.elbowR,
    pose.wristL,
    pose.wristR,
    pose.hip,
    pose.kneeL,
    pose.kneeR,
    pose.ankleL,
    pose.ankleR,
  ];

  return (
    <View style={styles.wrapper} testID={testID}>
      <Svg width={size} height={size} viewBox="0 0 200 200" style={styles.svg}>
        {GRID_COORDS.map((c) => (
          <React.Fragment key={c}>
            <Line x1={c} y1={8} x2={c} y2={192} stroke="#1e293b" strokeWidth={1} />
            <Line x1={8} y1={c} x2={192} y2={c} stroke="#1e293b" strokeWidth={1} />
          </React.Fragment>
        ))}
        <Line
          x1={16}
          y1={180}
          x2={184}
          y2={180}
          stroke={skin.accentColor}
          strokeOpacity={0.45}
          strokeWidth={2}
        />

        {renderProp(pose, skin)}

        {segments.map(([a, b], idx) => (
          <React.Fragment key={idx}>
            <Line
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={skin.glowColor}
              strokeWidth={skin.limbWidth + 4}
              strokeLinecap="round"
            />
            <Line
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={skin.limbColor}
              strokeWidth={skin.limbWidth}
              strokeLinecap="round"
            />
          </React.Fragment>
        ))}

        {skin.shoulderArmor && (
          <>
            <Circle
              cx={pose.shoulderL.x}
              cy={pose.shoulderL.y}
              r={skin.jointRadius + 3}
              fill={skin.accentColor}
              fillOpacity={0.35}
            />
            <Circle
              cx={pose.shoulderR.x}
              cy={pose.shoulderR.y}
              r={skin.jointRadius + 3}
              fill={skin.accentColor}
              fillOpacity={0.35}
            />
          </>
        )}

        {joints.map((j, idx) => (
          <Circle
            key={idx}
            cx={j.x}
            cy={j.y}
            r={skin.jointRadius}
            fill={skin.jointColor}
            stroke={skin.limbColor}
            strokeWidth={1.5}
          />
        ))}

        {renderHeadGlyph(pose, skin)}
      </Svg>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  svg: {
    borderRadius: 6,
    backgroundColor: '#070b14',
  },
  caption: {
    marginTop: 4,
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#94a3b8',
    letterSpacing: 0.4,
  },
});
