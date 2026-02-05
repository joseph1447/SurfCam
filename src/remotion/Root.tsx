import { Composition } from 'remotion';
import { SurferSnapLogo } from './SurferSnapLogo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SurferSnapLogo"
        component={SurferSnapLogo}
        durationInFrames={90}
        fps={30}
        width={500}
        height={150}
      />
    </>
  );
};
