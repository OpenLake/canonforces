import { GetServerSideProps } from 'next';
import { getPOTD } from '../../../services/potd_fetch';
export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const id = await getPOTD();
    return {
      redirect: {
        destination: `/questions/${id}`,
        permanent: false,
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};

const POTD = () => null;
export default POTD;
