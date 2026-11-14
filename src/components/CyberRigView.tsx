// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Pattern,
  Polygon,
  Rect,
  Stop,
} from 'react-native-svg';
import {
  ExerciseRigKeyframes,
  getHighlightedSegments,
  interpolateRigPose,
  RigPose,
} from '../engine/cyberRig';
import { RigSkin } from '../engine/rigSkins';

interface CyberRigViewProps {
  pose: RigPose;
  skin: RigSkin;
  size?: number;
  caption?: string;
  primaryMuscles?: string[];
  highlightColor?: string;
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
    const arcY = pose.propPos?.y ?? 194;
    return (
      <Path
        d={`M ${pose.wristL.x} ${pose.wristL.y} Q 100 ${arcY} ${pose.wristR.x} ${pose.wristR.y}`}
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
        <>
          <Polygon
            points={`${x - 10},${y - 2} ${x - 20},${y - 7} ${x - 10},${y + 3}`}
            fill={skin.accentColor}
          />
          <Polygon
            points={`${x + 10},${y - 2} ${x + 20},${y - 7} ${x + 10},${y + 3}`}
            fill={skin.accentColor}
          />
          <Polygon
            points={`${x - 13},${y + 4} ${x},${y - 16} ${x + 13},${y + 4}`}
            fill="none"
            stroke={skin.accentColor}
            strokeWidth={2}
          />
        </>
      )}
      {skin.headShape === 'crown' && (
        <>
          <Polygon
            points={`${x - 10},${y - 2} ${x - 21},${y - 8} ${x - 10},${y + 3}`}
            fill={skin.accentColor}
          />
          <Polygon
            points={`${x + 10},${y - 2} ${x + 21},${y - 8} ${x + 10},${y + 3}`}
            fill={skin.accentColor}
          />
          <Polygon
            points={`${x - 9},${y - 10} ${x - 4},${y - 17} ${x},${y - 11} ${x + 4},${y - 17} ${x + 9},${y - 10}`}
            fill={skin.jointColor}
          />
        </>
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
  primaryMuscles,
  highlightColor,
  testID,
}: CyberRigViewProps): React.ReactElement {
  const highlighted = getHighlightedSegments(primaryMuscles);
  const activeColor = highlightColor ?? skin.accentColor;
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
        <Defs>
          <LinearGradient id="torso-grad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={skin.accentColor} stopOpacity={0.45} />
            <Stop offset="50%" stopColor="#0f172a" stopOpacity={0.95} />
            <Stop offset="100%" stopColor={skin.limbColor} stopOpacity={0.35} />
          </LinearGradient>
          <Pattern id="armor-weave" width="8" height="8" patternUnits="userSpaceOnUse">
            <Rect width="8" height="8" fill="#0b1120" fillOpacity={0.4} />
            <Path
              d="M 0 8 L 8 0 M -2 2 L 2 -2 M 6 10 L 10 6"
              stroke={skin.limbColor}
              strokeOpacity={0.32}
              strokeWidth={1}
            />
          </Pattern>
        </Defs>
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

        {/* Armored Cyber-Cuirass / Torso Silhouette with Carbon-Fiber Weave */}
        <Polygon
          points={`${pose.shoulderL.x},${pose.shoulderL.y} ${pose.shoulderR.x},${pose.shoulderR.y} ${pose.hip.x + 12},${pose.hip.y} ${pose.hip.x - 12},${pose.hip.y}`}
          fill="url(#torso-grad)"
          stroke={highlighted.has(0) ? activeColor : skin.limbColor}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <Polygon
          points={`${pose.shoulderL.x},${pose.shoulderL.y} ${pose.shoulderR.x},${pose.shoulderR.y} ${pose.hip.x + 12},${pose.hip.y} ${pose.hip.x - 12},${pose.hip.y}`}
          fill="url(#armor-weave)"
        />

        {segments.map(([a, b], idx) => {
          const isHot = highlighted.has(idx);
          const edgeColor = isHot ? activeColor : skin.limbColor;
          return (
            <React.Fragment key={idx}>
              <Line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={isHot ? activeColor : skin.glowColor}
                strokeOpacity={isHot ? 0.55 : 0.9}
                strokeWidth={skin.limbWidth + (isHot ? 9 : 7)}
                strokeLinecap="round"
              />
              <Line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="#0f172a"
                strokeWidth={skin.limbWidth + 4}
                strokeLinecap="round"
              />
              <Line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={edgeColor}
                strokeWidth={skin.limbWidth}
                strokeLinecap="round"
              />
              <Line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={skin.jointColor}
                strokeOpacity={0.75}
                strokeWidth={1.3}
                strokeLinecap="round"
              />
            </React.Fragment>
          );
        })}

        {/* Cyber-Boots & Gauntlets */}
        <Polygon
          points={`${pose.ankleL.x - 5},${pose.ankleL.y} ${pose.ankleL.x + 8},${pose.ankleL.y} ${pose.ankleL.x + 10},${pose.ankleL.y + 5} ${pose.ankleL.x - 6},${pose.ankleL.y + 5}`}
          fill={skin.accentColor}
          stroke={skin.limbColor}
          strokeWidth={1.5}
        />
        <Polygon
          points={`${pose.ankleR.x - 5},${pose.ankleR.y} ${pose.ankleR.x + 8},${pose.ankleR.y} ${pose.ankleR.x + 10},${pose.ankleR.y + 5} ${pose.ankleR.x - 6},${pose.ankleR.y + 5}`}
          fill={skin.accentColor}
          stroke={skin.limbColor}
          strokeWidth={1.5}
        />

        {skin.shoulderArmor && (
          <>
            <Circle
              cx={pose.shoulderL.x}
              cy={pose.shoulderL.y}
              r={skin.jointRadius + 4}
              fill="#0f172a"
              stroke={skin.accentColor}
              strokeWidth={2}
            />
            <Circle
              cx={pose.shoulderR.x}
              cy={pose.shoulderR.y}
              r={skin.jointRadius + 4}
              fill="#0f172a"
              stroke={skin.accentColor}
              strokeWidth={2}
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

interface CyberRigPlayerProps {
  keyframes: ExerciseRigKeyframes;
  skin: RigSkin;
  primaryMuscles?: string[];
  highlightColor?: string;
}

const SCRUB_STEPS = [0, 0.25, 0.5, 0.75, 1];

/** Interactive 60fps ping-pong rig animator + phase scrub bar. */
export function CyberRigPlayer({
  keyframes,
  skin,
  primaryMuscles,
  highlightColor,
}: CyberRigPlayerProps): React.ReactElement {
  const [animating, setAnimating] = useState(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!animating) return;
    let rafId = 0;
    const startMs = Date.now();
    const tick = () => {
      const elapsed = (Date.now() - startMs) % 2200;
      const norm = elapsed / 1100;
      setPhase(norm <= 1 ? norm : 2 - norm);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [animating]);

  const currentPose = interpolateRigPose(keyframes.start, keyframes.end, phase);
  const activeColor = highlightColor ?? skin.accentColor;

  return (
    <View style={styles.playerWrap} testID="cyber-rig-player">
      <View style={styles.dualRow}>
        <CyberRigView
          pose={currentPose}
          skin={skin}
          size={196}
          primaryMuscles={primaryMuscles}
          highlightColor={activeColor}
          caption={`PHASE // ${Math.round(phase * 100)}%`}
          testID="exercise-rig-live"
        />
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity
          testID="rig-animate-toggle"
          onPress={() => setAnimating((a) => !a)}
          style={[
            styles.ctrlBtn,
            {
              borderColor: activeColor,
              backgroundColor: animating ? 'rgba(255,255,255,0.08)' : 'transparent',
            },
          ]}
        >
          <Text style={[styles.ctrlText, { color: activeColor }]}>
            {animating ? '⏸ PAUSE' : '▶ ANIMATE'}
          </Text>
        </TouchableOpacity>

        <View style={styles.scrubRow} testID="rig-scrub-bar">
          {SCRUB_STEPS.map((step) => {
            const active = !animating && Math.abs(phase - step) < 0.08;
            return (
              <TouchableOpacity
                key={step}
                testID={`rig-scrub-${Math.round(step * 100)}`}
                onPress={() => {
                  setAnimating(false);
                  setPhase(step);
                }}
                style={[
                  styles.scrubStep,
                  {
                    borderColor: active ? activeColor : '#334155',
                    backgroundColor: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                  },
                ]}
              >
                <Text style={[styles.scrubText, { color: active ? activeColor : '#94a3b8' }]}>
                  {Math.round(step * 100)}%
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  playerWrap: {
    alignItems: 'center',
    gap: 8,
  },
  dualRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsRow: {
    width: '100%',
    gap: 8,
    alignItems: 'center',
  },
  ctrlBtn: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  ctrlText: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  scrubRow: {
    flexDirection: 'row',
    gap: 6,
  },
  scrubStep: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  scrubText: {
    fontSize: 10,
    fontFamily: 'monospace',
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
