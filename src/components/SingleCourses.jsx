import { Link, useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import courses from '../data/courses';
import { useEffect } from 'react';

function SingleCourses() {
  const params = useParams();
  const navigate = useNavigate();

  const course = courses.find((course) => course.slug === params.slug);

  useEffect(() => {
    if (!course) {
      navigate('..', { relative: 'path' });
    }
  }, [course, navigate]);

  // if (!course) {
  //   return (
  //     <>
  //       <NotFound />
  //       <Link to=".." relative="path">
  //         All courses
  //       </Link>
  //     </>
  //   );
  // }

  return (
    <>
      <h1>{course?.title}</h1>
      <h2>{course?.slug}</h2>
      <h2>{course?.id}</h2>
      <Link to=".." relative="path">
        All courses
      </Link>
    </>
  );
}

export default SingleCourses;
