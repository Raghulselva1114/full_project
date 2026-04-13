from django.db import models
from accounts.models import User
from django.core.exceptions import ValidationError
import os


class Project(models.Model):
    project_name = models.CharField(max_length=255)
    description = models.TextField()

    start = models.DateField()
    end = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)

    image = models.ImageField(
        upload_to="project_images/",
        null=True,
        blank=True
    )

    def __str__(self):
        return self.project_name


class ProjectUser(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)



def validate_bim_file(value):
    allowed = [".rvt", ".ifc", ".dwg", ".nwd", ".nwc"]
    ext = os.path.splitext(value.name)[1].lower()

    if ext not in allowed:
        raise ValidationError("Only BIM files allowed")


def validate_pointcloud_file(value):
    allowed = [".e57", ".las", ".laz", ".pts", ".xyz", ".ply"]
    ext = os.path.splitext(value.name)[1].lower()

    if ext not in allowed:
        raise ValidationError("Only Point Cloud files allowed")


class BIMData(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    description = models.CharField(max_length=255)
    file = models.FileField(
        upload_to="bim_files/",
        validators=[validate_bim_file]
    )
    date = models.DateField()


class PointCloudData(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    description = models.CharField(max_length=255)
    file = models.FileField(
        upload_to="pointcloud_files/",
        validators=[validate_pointcloud_file]
    )
    date = models.DateField()