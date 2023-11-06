import { useCallback, useEffect, useState } from 'react';

import { httpGetLaunches, httpSubmitLaunch, httpAbortLaunch } from './requests';

function useLaunches(onSuccessSound, onAbortSound, onFailureSound) {
  const [launches, saveLaunches] = useState([]);
  const [isPendingLaunch, setPendingLaunch] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const getLaunches = useCallback(async () => {
    const fetchedLaunches = await httpGetLaunches();
    saveLaunches(fetchedLaunches);
  }, []);

  useEffect(() => {
    getLaunches();
  }, [getLaunches]);

  const submitLaunch = useCallback(
    async (e) => {
      e.preventDefault();
      setPendingLaunch(true);
      setErrorMessage('');
      const data = new FormData(e.target);
      const launchDate = new Date(data.get('launch-day'));
      const mission = data.get('mission-name');
      const rocket = data.get('rocket-name');
      const target = data.get('planets-selector');
      const response = await httpSubmitLaunch({
        launchDate,
        mission,
        rocket,
        target,
      });

      if (!mission) {
        setErrorMessage('Mission Name is required');
      }

      const success = response.ok;
      if (success) {
        getLaunches();
        setTimeout(() => {
          setPendingLaunch(false);
          onSuccessSound();
        }, 800);
      } else {
        setPendingLaunch(false); // Stop loading animation
        onFailureSound();
      }
    },
    [getLaunches, onSuccessSound, onFailureSound]
  );

  const abortLaunch = useCallback(
    async (id) => {
      const response = await httpAbortLaunch(id);

      const success = response.ok;
      if (success) {
        getLaunches();
        onAbortSound();
      } else {
        onFailureSound();
      }
    },
    [getLaunches, onAbortSound, onFailureSound]
  );

  return {
    launches,
    isPendingLaunch,
    errorMessage,
    submitLaunch,
    abortLaunch,
  };
}

export default useLaunches;
